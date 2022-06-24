#include <Arduino.h>

//FOR SD CARD :
#include <SPI.h>
#include <SD.h>
/* CODE PROTOTYPE - CARTE DATALOGGER*/
// Par Nicolas Stas
/*
 * POUR UTILISER CE CODE VOUS DEVEZ AVOIR INSTALER LA LIBRARY TIMER1 PRESENTE DANS CE DOSSIER
 * To install, simply unzip and put the files in Arduino/hardware/libraries/Timer1/ 
 */

/*
   Carte Arduino : Arduino Nano. Pensez a changer le type de carte dand Outils->Type de carte
   Microcontrolleur : Atmega328p. VÃ©rifiez dans Outils->Processeur que l'Atmega328 est bien selectionne.
   ATTENTION : Vous pouvez, suivant l'Arduino Nano que vous avez, avoir besoin de changer "Atmega 328" par "Atmega 328 (old bootloader)".
   Outils->Programmateur:AVRISP mkll
   N'oubliez de sÃ©lectionner un port dans Outils->Port
*/
/*
   Fonctions de cette carte :
    - calculer le PWM moteur et l'envoyer
    - receptioner les informations de capteurs (ie les valeurs sur 10 bits)
    - Ecrire les donnees dans une carte micro SD
    - Envoyer les donnees des capteurs par antenne grâce à la liaison série MySerial (voir plus bas)
*/
#define PERIOD_MOTOR_ORDER_US 100000
/*
    - A0 : tension batterie
    - A1 : tension moteur
    - A2 : tempÃ©rature  batterie
    - A3 : tempÃ©rature mosfet
    - A4 ou A5 : potentiomètre (ie liaison I2C utilisÃ©e pour le potentiomÃ¨tre)
    - A6 : courant moteur
    - A7 : tempÃ©rature moteur
    - D2 : vitesse
    - D3 : homme mort
    - D9 : pin 
    - D10 : CS (liaison SPI avec datalogger)
    - D11 : MOSI (liaison SPI avec datalogger)
    - D12 : MISO (liaison SPI avec datalogger)
    - D13 : SCK (liaison SPI avec datalogger)
*/
// for platformio
long readVcc();
void EcritureCarteSD(File actualfichierSD);
void InitialisationEcriture(File fichierSD);
void interruption();
// PID
float erreur;
float erreurPrecedente;
float sommeErreur;
float deltaErreur;
float kp = 0.0;//0.1
float ki = 0.5;
float kd = 0.0; //0.1

// Déclaration de la liaison série pour l'antenne
//#include <SoftwareSerial.h>
//SoftwareSerial mySerial(5, 6); // RX, TX

//FOR THE PWM :
//#include <PWM.h> //for a PWM frequency of our choice

// Déclaration des variables de stockage de la valeur des capteurs (valeur sur 10 bits)
uint32_t actualtime;
float tensionbatterie;
float tensionmoteur;
float temperaturebatterie;
float temperaturemosfet;
float courantMoteur;
float puissanceMoteur;
float temperaturemoteur;
float vitesse;
float courantLimite = 1; //A
float perimetrepardeux = 1.59;
float lastoccurrence=0.0;
float puissanceconsigne = 200.0; // watt
float dutyCycle=0.0;
float rpm;
float period;
float Rmotor=0.608;//ohm
float omega=102.0;//rpm/V
uint8_t cpt = 0;
float potVal;
float Amp0 = 102.0;
int sendcount=0;
int sendrate=4; // 4*50 = 200ms

File fichierSD;
String nomFichier = "";

void setup() {
  Serial.begin (115200);
  //mySerial.begin (9600);

  //Initialise les pins anologique
    pinMode(A0,INPUT);
    pinMode(A1,INPUT);
    pinMode(A2,INPUT);
    pinMode(A3,INPUT);
    pinMode(A4,INPUT);
    pinMode(A5,INPUT);
    pinMode(A6,INPUT);
    pinMode(A7,INPUT);
    
    //Initialise la valeur du capteur de courant
    for(int i=0;i<20;i++){
      int val = analogRead(A6);
      Amp0=(val<Amp0)?val:Amp0;
    }
    Serial.println();
    Serial.print(" amp0 is: ");
    Serial.println(Amp0);

  
  // SD CARD
  /*At first we must check if the SD card exists. We use function SD.exists(pinSS), where pinSS is 10 for arduino uno and 53 for arduino mega*/
  if (!SD.begin(10)) {
    Serial.println(F("Initialisation impossible !")); 
    return;
  }
  Serial.println(F("Initialisation OK"));
  int  index = 1;
  while (SD.exists("interu" + String(index) + ".csv")) {
    index++;
  }
  nomFichier = "interu" + String(index) + ".csv";
  Serial.println(nomFichier);
  InitialisationEcriture(fichierSD);
  
    //FOR THE PWM :
    pinMode(9, OUTPUT);
    analogWrite(9,0);
    TCCR1B = TCCR1B & B11111000 | B00000001; // for PWM frequency of 3921.16 Hz
    
    //analogWrite(9,0);
    //InitTimersSafe();
    //SetPinFrequencySafe(9, 17200);
    //pwmWrite (9, 0);
    
    //Capteur de vitesse
    pinMode (2, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(2),interruption,RISING);

    
}


void loop() {
  
  EcritureCarteSD(fichierSD);

  //Calcul de la tension batterie
  float vcc = readVcc()/1000.0;
  
  //Porcentage du potentiomètre (entre 0 et 1)
  potVal = analogRead(A4)/1023.0;
  // potVal = 2.45*potVal*potVal*potVal -2.12*potVal*potVal + 0.67*potVal;

  
  //On donne une consigne au moteur qui dépend de la puissance désirée
  float target = puissanceconsigne*potVal;
  tensionbatterie = analogRead(A0)/1024.0*vcc*10.0;
  courantMoteur = ((analogRead(A6)-Amp0)*(vcc/1024.0))/0.08;

  puissanceMoteur = courantMoteur*tensionbatterie*dutyCycle/255.0;
  
  //Calcul de la vitesse à partir du courant passant par le moteur
  float VBEMF = ((dutyCycle/255.0)*tensionbatterie) - (0.32*Rmotor) ;//https://www.precisionmicrodrives.com/ab-021
  rpm = VBEMF*omega;


  //Calcul des températures
  temperaturemoteur = ((float)(analogRead(A7))/1024*5 -0.5)*100; 
  temperaturebatterie = ((float)(analogRead(A2))/1024*5 -0.5)*100; 
  temperaturemosfet = ((float)(analogRead(A3))/1024*5 -0.5)*100; 


  //Asservissement en puissance
  if(potVal>0.02) {
    erreur = target - courantMoteur*tensionbatterie*dutyCycle/255.0;//erreur = consigne - puissance = consigne - (courant * tensionMoteur)
  }else{
    erreur = 0.0-courantMoteur*tensionbatterie*10.0*dutyCycle/255.0;
    //analogWrite(9,0);
  }

  //Erreur intégrale
  sommeErreur +=(erreur>3.0)?3.0:erreur;
  if(sommeErreur>(255.0/ki)) sommeErreur = 255.0/ki;
  if(sommeErreur<0)sommeErreur=0;

  //Pourcentage de la puissance de sortie
  dutyCycle = sommeErreur*ki+erreur*kp;
  if(dutyCycle>255)dutyCycle=255;
  if(dutyCycle<0)dutyCycle=0;

  //Activation du moteur
  analogWrite(9,(int)dutyCycle);
  TCCR1B = TCCR1B & B11111000 | B00000001; // for PWM frequency of 3921.16 Hz
  //pwmWrite(9, (int)dutyCycle);
  sendcount++;
  if (sendcount>=sendrate){
    sendcount=0;
    // format the message as json
    String json = "{\"A\":" + String(courantMoteur) + ",\"R\":" + String(rpm) + ",\"V\":" + String(vitesse) + ",\"U\":" + String(tensionbatterie) + ",\"T\":" + String(analogRead(A1)/1024.0*vcc*10.0) + ",\"M\":" + String(temperaturemoteur) + ",\"B\":" + String(temperaturebatterie) + ",\"O\":" + String(temperaturemosfet) + ",\"D\":" + String(dutyCycle) + ",\"C\":" + String(target) + ",\"P\":" + String(puissanceMoteur) + "}";
    Serial.println(json);
  }
  delay(50);
}

void interruption(){
  float occurrence = (float)(millis());
  period = (occurrence - lastoccurrence)/60000.0;
  lastoccurrence = occurrence;
  if(period>0){
    vitesse=1.0/(period);// ms -> min rpm
  }
  //Serial.println(vitesse);
}

void InitialisationEcriture (File actualfichierSD)
{
  fichierSD = SD.open(nomFichier, FILE_WRITE);
  if (fichierSD) {
    fichierSD.print ("temps");
    fichierSD.print(";");
    fichierSD.print ("puissance");
    fichierSD.print(";");
    fichierSD.print ("tension batterie");
    fichierSD.print(";");
    fichierSD.print ("tension moteur");
    fichierSD.print(";");
    fichierSD.print("courant moteur (bit)");
    fichierSD.print(";");
    fichierSD.print ("temperature batterie");
    fichierSD.print(";");
    fichierSD.print ("temperature moteur");
    fichierSD.print(";");
    fichierSD.print ("temperature mosfet");
    fichierSD.print(";");
    fichierSD.print("period");
    fichierSD.print(";");
    fichierSD.print("rapport cyclique");
    fichierSD.print(";");
    //fichierSD.print("pourcentage batterie");
    //fichierSD.print(";");
    fichierSD.print("\n");
    fichierSD.print(";;;;");
    fichierSD.print(Amp0);
    fichierSD.print("(initial)");
    fichierSD.print("\n");
    fichierSD.close();
  }
}

void EcritureCarteSD (File actualfichierSD)
{
  /*
  tensionbatterie = analogRead(A0);
  tensionmoteur = analogRead(A1);
  temperaturebatterie = analogRead(A2);
  temperaturemosfet = analogRead(A3);
  courantMoteur = analogRead(A6);
  temperaturemoteur = analogRead(A7);
  float periode = pulseIn (2, HIGH, 1000000) ;      
  periode = 0.93*(3.6*1000000*perimetrepardeux / (0.94*periode));
  Serial.println(periode);
  */ 
  actualtime = millis();
  //mySerial.print(String(actualtime)+";"+String(tensionbatterie)+";"+String(tensionmoteur)+";"+String(temperaturebatterie)+";"+String(temperaturemosfet)+";"+String(courantmoteur)+";"+String(temperaturemoteur)+";"+String(vitesse)+";"+String(currentdutyCycle));
  //mySerial.println();
  
  // SENDING DATA TO SD CARD
  actualfichierSD = SD.open(nomFichier, FILE_WRITE);
  if (actualfichierSD) {
    //Serial.println(F("Ecriture en cours"));
    actualfichierSD.print(actualtime);
    actualfichierSD.print(";");
    actualfichierSD.print(puissanceMoteur);
    actualfichierSD.print(";");
    actualfichierSD.print(tensionbatterie);
    actualfichierSD.print(";");
    actualfichierSD.print(tensionmoteur);
    actualfichierSD.print(";");
    actualfichierSD.print(courantMoteur);
    actualfichierSD.print(";");
    actualfichierSD.print(temperaturebatterie);
    actualfichierSD.print(";");
    actualfichierSD.print (temperaturemoteur);
    actualfichierSD.print(";");
    actualfichierSD.print(temperaturemosfet );
    actualfichierSD.print(";");
    actualfichierSD.print(period);
    actualfichierSD.print(";");
    actualfichierSD.print(dutyCycle);
    actualfichierSD.print(";");
    //actualfichierSD.print(pourcentageBatterie);
    //actualfichierSD.print(";");
    actualfichierSD.print("\n");
    actualfichierSD.close();
   }
}

long readVcc() {
  long result;
  // Read 1.1V reference against AVcc
  #if defined(_AVR_ATmega32U4_) || defined(_AVR_ATmega1280_) || defined(_AVR_ATmega2560_)
  ADMUX = _BV(REFS0) | _BV(MUX4) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #elif defined (_AVR_ATtiny24_) || defined(_AVR_ATtiny44_) || defined(_AVR_ATtiny84_)
  ADMUX = _BV(MUX5) | _BV(MUX0);
  #elif defined (_AVR_ATtiny25_) || defined(_AVR_ATtiny45_) || defined(_AVR_ATtiny85_)
  ADMUX = _BV(MUX3) | _BV(MUX2);
  #else
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #endif
  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Convert
  while (bit_is_set(ADCSRA, ADSC));
  result = ADCL;
  result |= ADCH << 8;
  result = 1126400L / result; // Calculate Vcc (in mV); 1126400 = 1.1*1024*1000
  return result;
}