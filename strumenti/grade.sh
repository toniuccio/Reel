# uso: grade.sh clip  -> stampa la catena di filtri colore per quella clip (dopo il tonemap)
case $1 in
9194) G="rr=1.12:gg=1.16:bb=1.06";E="0.98";;
9200) G="rr=1.26:gg=1.26:bb=1.18";E="0.97";;
9202) G="rr=1.14:gg=1.12:bb=1.10";E="1.00";;
9220) G="rr=1.24:gg=1.20:bb=1.32";E="1.06";;
9233) G="rr=0.98:gg=1.07:bb=1.00";E="1.04";;
9235) G="rr=1.03:gg=1.03:bb=1.12";E="1.02";X=",curves=master='0/0.03 0.18/0.26 0.4/0.52 0.65/0.74 1/0.98'";;
9236) G="rr=1.00:gg=1.02:bb=1.06";E="1.04";;
9239) G="rr=1.06:gg=0.97:bb=0.98";E="1.05";;
9241) G="rr=1.08:gg=1.00:bb=1.00";E="1.07";;
esac
echo "colorchannelmixer=$G,eq=gamma=$E:saturation=0.88,curves=master='0/0.045 0.25/0.255 0.5/0.5 0.75/0.755 1/0.95'$X"
