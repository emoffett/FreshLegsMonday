Play Store App

The Play Store Android App is Trusted Web Activity (TWA) generated using Bubblewrap. The initial bubblewrap command is:

`bubblewrap init --manifest="https://freshlegsmonday.com/site.webmanifest" --directory="./twa"`

Default values are used and no additional permissions should be requested.
Use the appropriate keystore location in your local environment.

From the /twa/ directory, build the TWA using

`bubblewrap build`

Upload the .aab bundle to https://play.google.com/console/u/0/developers/

Go through the release cycles, updating the PlayStore screenshots, description, etc:
Preview asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151 :
1. [x] Short description (80char): Marathon finish time predictor
2. [x] Full description (4000char): Fresh Legs Monday allows you to predict your Marathon finish time using the distance and pace that you typically run each week. You can use this app to guide your weekly training to achieve your target Marathon time.
3. [x] Feature graphic of in-app experience with no alpha PNG/JPG 1024x500px (landscape)
4. [x] Screenshots - These should be 16:9 for landscape (minimum 1920x1080px) screenshots and 9:16 for portrait screenshots (minimum 1080x1920px).

Digital Asset Link

Update the `.well-known/assetlinks.json` with the Play Store generated json at the bottom of
Setup -> App Integrity -> App Signing
