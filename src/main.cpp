
#include <ESP8266WiFi.h>
#include <Hash.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include "index.html.gz.h"

#define Y_PIN 14
#define X_PIN 12
#define BUTTON_PIN 13
/*
const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 1, 1);
DNSServer dnsServer;
//const char* hostName = "esp-async";
*/

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
char last_modified[50];
const int stepsPerUpdate = 2;

const char* WIFI_SSID = "NodeMCU";
const char* WIFI_PASS = "testtest";

void onHome(AsyncWebServerRequest *request);
int get_joystick_x();
int get_joystick_y();

void setup(){
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  pinMode(Y_PIN, OUTPUT);
  pinMode(X_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(Y_PIN, LOW);
  digitalWrite(X_PIN, LOW);

  sprintf(last_modified, "%s %s GMT", __DATE__, __TIME__);

  //WiFi.hostname(hostName);
  WiFi.mode(WIFI_AP);
  //WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(WIFI_SSID, WIFI_PASS);

  //dnsServer.start(DNS_PORT, "*", apIP);

  server.addHandler(&ws);
  server.on("/index.html", HTTP_GET, onHome);
  server.onNotFound([](AsyncWebServerRequest *request){ request->redirect("/index.html"); });
  server.begin();

  IPAddress HTTPS_ServerIP = WiFi.softAPIP();
  Serial.print("Server IP is: ");
  Serial.println(HTTPS_ServerIP);
}

void loop() {
  //dnsServer.processNextRequest();

  int x = get_joystick_x();
  int y = get_joystick_y();
  if (x != 0 || y != 0) {
    ws.textAll("{\"event\": \"move\", \"x\":" + String(x) + ",\"y\":" + String(y) + "}");
  }
  if (digitalRead(BUTTON_PIN) == LOW) {
    ws.textAll("{\"event\": \"button-down\"}");
  }
  delay(50);
}

void onHome(AsyncWebServerRequest *request) {
  if (request->header("If-Modified-Since").equals(last_modified)) {
    request->send(304);
    return;
  }
  AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", index_html_gz, index_html_gz_len);
  response->addHeader("Content-Encoding", "gzip");
  response->addHeader("Last-Modified", last_modified);
  request->send(response);
}

int normalized(int value) {
  if (value > 500 && value < 600) {
    return 0;
  }
  return value >= 500 ? -stepsPerUpdate : stepsPerUpdate;
}

int get_joystick_x() {
  digitalWrite(X_PIN, HIGH);
  digitalWrite(Y_PIN, LOW);
  return normalized(analogRead(A0));
}

int get_joystick_y() {
  digitalWrite(X_PIN, LOW);
  digitalWrite(Y_PIN, HIGH);
  return -normalized(analogRead(A0));
}
