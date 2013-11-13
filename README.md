# Reporter

Web-app för att registrera felraporter, förslag mm.

* öppna med en target - http://host/reporter/?target=thetarget
* se alla rapporter för denna target eller skapa ny rapport
* en rapport innehåller
    * typ
    * beskrivning 
    * fotobilaga från kameran

## Exempel

Gå till http://host/reporter/?target=grej

![](img/reporter-kopiator37.png)

Klicka Ny rapport, välj typ och skriv en felbeskrivning

![](img/reporter-kopiator37-ny-rapport.png)

Klicka Spara

![](img/reporter-kopiator37-lista.png)

Klicka på rapporten

![](img/reporter-kopiator37-redigera-rapport.png)

Klicka på kamera-symbolen, och ta en bild med kameran, godkänn bilden och klicka Spara i Reporter.

<bild av den nya bilagan>

## Implementation

Jag trodde jag skulle behöva skriva en riktig App för android och iPhone för att implementer a detta, men det räcker ju med HTML5! Kräver ingen installation av användaren.

### Arkitektur

Mobile visar webbsidan som hanterar data via en REST-tjänst på servern som lagrar data i en relationsdatabas.

![](img/architecture-model.png)

REST-tjänst och web-app-fier servas av en node.js-server.

### databasmodell

![](img/database-model.png)

### REST-tjänst

* GET /ws/targets/:target/reports - returnerar lista av rapporter i JSON
* GET /ws/reports/:id - returnerar rapport med id i JSON
* POST /ws/reports - skapar ny rapport från postad JSON
* PUT /ws/reports/:id - uppdaterar rapport id från postad JSON
* DELETE /ws/reports/:id - tar bort raport id
* POST /ws/attachments - laddar upp mime-typad bilaga från postad binärdata
* GET /ws/attachments/:id/raw - returnerar mime-typad bilaga i binärform

