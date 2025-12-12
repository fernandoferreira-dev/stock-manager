#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>


#define RST_PIN         9
#define SS_PIN          10


MFRC522 mfrc522(SS_PIN, RST_PIN);


unsigned long lastReadTime = 0;
const unsigned long DEBOUNCE_DELAY = 2000; 

void setup() {
  Serial.begin(9600);
  while (!Serial); 
  
  
  SPI.begin();
  
  
  mfrc522.PCD_Init();
  
  
  delay(4);
  
  
  mfrc522.PCD_DumpVersionToSerial();
  
  
  Serial.println("{\"status\":\"ready\",\"message\":\"RC522 inicializado. Aguardando cartoes...\"}");
}

void loop() {
  
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  
  
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }
  
  
  unsigned long currentTime = millis();
  if (currentTime - lastReadTime < DEBOUNCE_DELAY) {
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    return;
  }
  lastReadTime = currentTime;
  
 
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (i > 0) uidString += ":";
    
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uidString += "0";
    }
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();
  
  
  StaticJsonDocument<200> doc;
  doc["uid"] = uidString;
  doc["timestamp"] = millis();
  doc["card_type"] = getCardType();
  
  
  serializeJson(doc, Serial);
  Serial.println();
  
 
  mfrc522.PICC_HaltA();
  
  
  mfrc522.PCD_StopCrypto1();
}


String getCardType() {
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  String typeName = mfrc522.PICC_GetTypeName(piccType);
  return typeName;
}