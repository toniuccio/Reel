"""Scena prodotto in Blender senza aprire Blender (livello 3 della skill motion-graphics).
Applica le regole del video: una sola luce principale (consiglio 11), profondità di campo ridotta
(consiglio 7), soggetto al centro esatto (consiglio 4), camera sempre in movimento (consiglio 5).

uso:
  python3 strumenti/blender/scena_prodotto.py --modello prodotto.glb --uscita out/frames \
      [--secondi 4] [--fps 30] [--fondo nero|bianco|trasparente] [--movimento orbita|avvicina|sale] \
      [--formato 1080x1920] [--campioni 64] [--anteprima]
Senza --modello usa un oggetto segnaposto (capsula). Esce una sequenza PNG da usare in Remotion
con <Img>/<OffthreadVideo> o da unire con ffmpeg. Richiede `pip install bpy` (Python 3.13).
"""
import argparse, math, os
import bpy
from mathutils import Vector

ap = argparse.ArgumentParser()
ap.add_argument("--modello")
ap.add_argument("--uscita", required=True)
ap.add_argument("--secondi", type=float, default=4)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--fondo", default="nero", choices=["nero", "bianco", "trasparente"])
ap.add_argument("--movimento", default="orbita", choices=["orbita", "avvicina", "sale"])
ap.add_argument("--formato", default="1080x1920")
ap.add_argument("--campioni", type=int, default=64)
ap.add_argument("--anteprima", action="store_true", help="un solo fotogramma a metà, mezza risoluzione")
a = ap.parse_args()

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
W, H = (int(x) for x in a.formato.split("x"))

# --- soggetto -------------------------------------------------------------------------------
if a.modello:
    ext = os.path.splitext(a.modello)[1].lower()
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=a.modello)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=a.modello)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=a.modello)
    elif ext == ".stl":
        bpy.ops.wm.stl_import(filepath=a.modello)
    else:
        raise SystemExit(f"formato non gestito: {ext}")
    objs = [o for o in sc.objects if o.type == "MESH"]
else:
    # segnaposto: scatola arrotondata (tipo custodia) con smussatura
    bpy.ops.mesh.primitive_cube_add(size=2)
    o = bpy.context.object
    o.scale = (0.9, 0.45, 0.75)
    bpy.ops.object.transform_apply(scale=True)
    bev = o.modifiers.new("smusso", "BEVEL"); bev.width = 0.35; bev.segments = 12
    bpy.ops.object.shade_smooth()
    m = bpy.data.materials.new("plastica"); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.92, 0.92, 0.92, 1); b.inputs["Roughness"].default_value = 0.25
    o.data.materials.append(m)
    objs = [o]

# centra e normalizza: il soggetto sta nel centro esatto e alto circa 2 unità
pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
centro, dim = (mn + mx) / 2, max(mx - mn)
radice = bpy.data.objects.new("soggetto", None); sc.collection.objects.link(radice)
for o in objs:
    if o.parent is None:
        o.parent = radice
radice.location = -centro * (2 / dim); radice.scale = [2 / dim] * 3

# --- luce: una sola sorgente principale, più un riempimento debolissimo ------------------------
bpy.ops.object.light_add(type="AREA", location=(3.5, -1.0, 3.0))
key = bpy.context.object; key.data.energy = 350; key.data.size = 1.2
key.rotation_euler = (math.radians(50), 0, math.radians(50))
bpy.ops.object.light_add(type="AREA", location=(-3, 1.5, 1)); fill = bpy.context.object
fill.data.energy = 15; fill.data.size = 4

w = bpy.data.worlds.new("mondo"); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (1, 1, 1, 1) if a.fondo == "bianco" else (0, 0, 0, 1)
bg.inputs["Strength"].default_value = 1.0 if a.fondo == "bianco" else 0.0
sc.render.film_transparent = a.fondo == "trasparente"

# --- camera: lenta, sempre in movimento, profondità di campo ridotta -------------------------
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 85
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 2.0
mira = bpy.data.objects.new("mira", None); sc.collection.objects.link(mira)
cam.data.dof.focus_object = mira
t = cam.constraints.new("TRACK_TO"); t.target = mira; t.track_axis = "TRACK_NEGATIVE_Z"; t.up_axis = "UP_Y"

n = max(1, round(a.secondi * a.fps)); sc.frame_start, sc.frame_end = 1, n
sc.render.fps = a.fps
dist = 15.0 * (H / W if H > W else 1) ** 0.5
for f, k in ((1, 0.0), (n, 1.0)):
    if a.movimento == "orbita":
        ang = math.radians(-20 + 40 * k); pos = (dist * math.sin(ang), -dist * math.cos(ang), 0.6)
    elif a.movimento == "avvicina":
        d = dist * (1.15 - 0.25 * k); pos = (0.4, -d, 0.5)
    else:
        pos = (0.3, -dist, -0.8 + 1.8 * k)
    cam.location = pos; cam.keyframe_insert("location", frame=f)
for fc in (cam.animation_data.action.fcurves if hasattr(cam.animation_data.action, "fcurves") else []):
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"; kp.easing = "EASE_IN_OUT"

# --- render ---------------------------------------------------------------------------------
sc.render.engine = "CYCLES"; sc.cycles.samples = a.campioni; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA" if a.fondo == "trasparente" else "RGB"
os.makedirs(a.uscita, exist_ok=True)
if a.anteprima:
    sc.render.resolution_percentage = 50; sc.frame_set(n // 2)
    sc.render.filepath = os.path.join(os.path.abspath(a.uscita), "anteprima.png")
    bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(os.path.abspath(a.uscita), "f_")
    bpy.ops.render.render(animation=True)
print("fatto:", a.uscita)
