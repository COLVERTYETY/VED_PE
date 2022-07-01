#include <Arduino.h>
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

// fir filter class
class FIRFilter {
  public:
    FIRFilter(int order, float* coefficients);
    float filter(float input);
    void setCoefficients(float* coefficients);
    void setOrder(int order);
    int getOrder();
    float *getCoefficients();
    ~FIRFilter();
  private:
    int order;
    float *coefficients;
    float *inputs;
};

FIRFilter::FIRFilter(int order, float* coefficients) {
  this->order = order;
  this->coefficients = coefficients;
  this->inputs = new float[order];
}

FIRFilter::~FIRFilter() {
  delete[] inputs;
}

void FIRFilter::setCoefficients(float* coefficients) {
  this->coefficients = coefficients;
}

void FIRFilter::setOrder(int order) {
  this->order = order;
}

int FIRFilter::getOrder() {
  return this->order;
}

float * FIRFilter::getCoefficients() {
  return this->coefficients;
}

float FIRFilter::filter(float input) {
  // shift the data
  for (int i = 0; i < order; i++) {
    inputs[i] = inputs[i + 1];
  }
  // add the new data
  inputs[order - 1] = input;
  // calculate the output
  float output = 0;
  for (int i = 0; i < order; i++) {
    output += coefficients[i] * inputs[i];
  }
  return output;
}


// for platformio
long readVcc();
void interruption();
// PID
float erreur;
float erreurPrecedente;
float sommeErreur;
float deltaErreur;
float kp = 0.0;//0.1
float ki = 0.3;
float kd = 0.0; //0.1

// Déclaration de la liaison série pour l'antenne
//#include <SoftwareSerial.h>
//SoftwareSerial mySerial(5, 6); // RX, TX

//FOR THE PWM :
//#include <PWM.h> //for a PWM frequency of our choice

// Déclaration des variables de stockage de la valeur des capteurs (valeur sur 10 bits)
uint32_t actualtime;
const float Dgrand = 280.0; // en mm
const float Dpetit = 30.0; // en mm
const float ratio = Dpetit/Dgrand;
float tensionbatterie;
float tensionmoteur;
float temperaturebatterie;
float temperaturemosfet;
float courantMoteur;
float puissanceMoteur;
float temperaturemoteur;
float vitesse;
float courantLimite = 1; //A
float perimetre = 1.59; // en m
float target_speed = 10.0; // en km/h

float lastoccurrence=0.0;
float puissanceconsigne = 100.0; // watt
float dutyCycle=0.0;
float rpm;
float period;
float Rmotor=1350.0;//0.608;//ohm
float omega=102.0;//rpm/V
uint8_t cpt = 0;
float potVal=0;
FIRFilter pot_filter(5, new float[5]{0.2, 0.2, 0.2, 0.2, 0.2});
float Amp0 = 102.0;
int sendcount=0;
int sendrate=2; // 2*50 = 100ms
bool ledstatus=false;

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
  pinMode (LED_BUILTIN,OUTPUT);
    
  // conversion vitesse en rpm
  target_speed*=60.0;// km/min
  target_speed/=1000.0;// m/min
  target_speed/=perimetre;// rpm

  // homme mort
  pinMode(3, INPUT_PULLUP);
}


void loop() {

  //Calcul de la tension batterie
  float vcc = readVcc()/1000.0;
  
  //Porcentage du potentiomètre (entre 0 et 1)
  potVal = pot_filter.filter(analogRead(A4)/1024.0);
  // potVal = 2.45*potVal*potVal*potVal -2.12*potVal*potVal + 0.67*potVal;
  
  //On donne une consigne au moteur qui dépend de la puissance désirée
  float target = target_speed*potVal;
  if (potVal<0.1) target = 0.0;
  tensionbatterie = analogRead(A0)/1024.0*vcc*10.0;

  analogWrite(9, 0);
  // delayMicroseconds(8);
  courantMoteur = ((analogRead(A6)-Amp0)*(vcc/1024.0))/0.08;
  tensionmoteur =((analogRead(A1))/1024.0*vcc*10.0);
  //Activation du moteur
  analogWrite(9,(int)dutyCycle);
  TCCR1B = TCCR1B & B11111000 | B00000001; // for PWM frequency of 3921.16 Hz
  // analogWrite(9,(int)dutyCycle);
  // TCCR1B = TCCR1B & B11111000 | B00000001; // for PWM frequency of 3921.16 Hz
  //Calcul de la vitesse à partir du courant passant par le moteur
  // float VBEMF = (tensionmoteur) - (0.32*Rmotor);//https://www.precisionmicrodrives.com/ab-021
  float VBEMF = (tensionbatterie*potVal) - courantMoteur*Rmotor;// 0.6
  // float VBEMF = (tensionbatterie*potVal/40.0) - courantMoteur*Rmotor;// 0.6
  // float VBEMF =  (courantMoteur*Rmotor) - tensionmoteur + tensionbatterie -0.3;// 0.6
  rpm = VBEMF*omega;

  puissanceMoteur = courantMoteur*(tensionbatterie*potVal);// la veritable puissance du moteur en watt

  // pid vitesse
  erreur = target - rpm;
  sommeErreur += erreur;
  if (sommeErreur>60.0/ki) sommeErreur=60.0/ki;
  if (sommeErreur<0.0) sommeErreur=0.0;

  dutyCycle = ki*sommeErreur;
  if (digitalRead(3)==HIGH) dutyCycle = 0.0;
  analogWrite(9,(int)dutyCycle);
  TCCR1B = TCCR1B & B11111000 | B00000001; // for PWM frequency of 3921.16 Hz
  //Calcul des températures
  temperaturemoteur = ((float)(analogRead(A7))/1024.0*vcc -0.5)*100.0; 
  temperaturebatterie = ((float)(analogRead(A2))/1024.0*vcc -0.5)*100.0; 
  temperaturemosfet = ((float)(analogRead(A3))/1024.0*vcc -0.5)*100.0; 

  //pwmWrite(9, (int)dutyCycle);
  sendcount++;
  if (sendcount>=sendrate){
    sendcount=0;
    // format the message as json
    // String json = "{\"A\":" + String(courantMoteur) + ",\"R\":" + String(rpm) + ",\"V\":" + String(vitesse) + ",\"U\":" + String(tensionbatterie) + ",\"T\":" + String(analogRead(A1)/1024.0*vcc*10.0) + ",\"M\":" + String(temperaturemoteur) + ",\"B\":" + String(temperaturebatterie) + ",\"O\":" + String(temperaturemosfet) + ",\"D\":" + String(dutyCycle) + ",\"C\":" + String(target) + ",\"P\":" + String(puissanceMoteur) + "}";
    //format message in json with only the courant
    Serial.print("{\"A\":");
    Serial.print(courantMoteur);
    Serial.print(",\"R\":");
    Serial.print(rpm*ratio/60.0*perimetre*1000.0);
    Serial.print(",\"V\":");
    Serial.print(vitesse/60.0*perimetre*1000.0);
    Serial.print(",\"U\":");
    Serial.print(tensionbatterie);
    Serial.print(",\"T\":");
    Serial.print(tensionmoteur);
    Serial.print(",\"M\":");
    Serial.print(temperaturemoteur);
    Serial.print(",\"B\":");
    Serial.print(temperaturebatterie);
    Serial.print(",\"O\":");
    Serial.print(temperaturemosfet);
    Serial.print(",\"D\":");
    Serial.print(dutyCycle);
    Serial.print(",\"C\":");
    Serial.print(target);
    Serial.print(",\"P\":");
    Serial.print(puissanceMoteur);
    Serial.print(",\"L\":");
    Serial.print(potVal);
    Serial.print("}");
    Serial.println();
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
  ledstatus = !ledstatus;
  digitalWrite(LED_BUILTIN,ledstatus);
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