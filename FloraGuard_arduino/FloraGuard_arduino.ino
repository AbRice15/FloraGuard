#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define SOIL_PIN A0
#define LIGHT_PIN A1
#define FAN_PIN 3
#define PUMP_PIN 13

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int soilVal = analogRead(SOIL_PIN);
  int lightVal = analogRead(LIGHT_PIN);

  int soilPercent = map(soilVal, 1023, 300, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  int lightPercent = map(lightVal, 0, 1023, 0, 100);

  bool fanState = false;
  bool pumpState = false;

  if (!isnan(temp) && !isnan(hum)) {
    // Fan logic (Temp >= 34°C)
    if (temp >= 34.0) {
      digitalWrite(FAN_PIN, HIGH);
      fanState = true;
    } else {
      digitalWrite(FAN_PIN, LOW);
    }

    // Pump logic (Humidity < 50%)
    if (soilPercent > 85.0) {
      digitalWrite(PUMP_PIN, HIGH);
      pumpState = true;
    } else {
      digitalWrite(PUMP_PIN, LOW);
    }

    // MUST print in this exact 6-value CSV format:
    Serial.print(temp);
    Serial.print(",");
    Serial.print(hum);
    Serial.print(",");
    Serial.print(soilPercent);
    Serial.print(",");
    Serial.print(lightPercent);
    Serial.print(",");
    Serial.print(fanState ? 1 : 0);
    Serial.print(",");
    Serial.println(pumpState ? 1 : 0);
  }

  delay(2000);
}