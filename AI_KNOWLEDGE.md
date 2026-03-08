# Rebels Knowledge Base

## Screen is flickering / Video glitching
The HDMI capture card connection to the iPad is likely loose. Disconnect the USB-C hub and firmly reconnect it. Ensure the cable isn't hanging loosely.

## No Audio / Cannot hear Commentator
Ensure the Rode Wireless Go II receiver is powered ON (long press the power button). Check that the 3.5mm audio cable is securely plugged into the Mic port on the Sony Camera, NOT the headphone port.

## Stream Disconnects / Dropping Frames
This usually happens if the Telstra 5G hotspot overheats in the sun. Move the hotspot into the shade under the scorer's tent. If the signal is just weak, switch the iPad's connection to the "RebelsNet24" local Wi-Fi.

## Black Screen / No Video Feed
The Nearstream VM33 battery might be dead, or it disconnected from the Camera Network. Check if the VM33 power light is on. If it's on, restart the Dugout Hub router.

## I cant log into the streaming software

The global organization email is <CLUB_EMAIL> and the universal password available in the .env file. This single, centralized login applies to all of our core broadcasting services, including Sideline Pro (for the scoreboard overlays and stream routing), Mevo Pro, and NearStream accounts (for camera control). Having a universal login ensures that any volunteer can step in and run the broadcast without being locked out.

## the netgear modem has run out of data

For the internet connection, the cellular service runs on a Nathan Hughes prepaid account. If the modem runs out of data or requires an account top-up mid-tournament, this is the account name that needs to be referenced you will need to call Nathan Hughes to top up the account his number is 0433 172 601. Always ensure you are logged into the correct Google account on the control tablet or phone before opening the streaming apps to prevent credential conflicts.

## I need the IP addresses, admin passwords, Wi-Fi passwords, and serial numbers for our networking gear

Because we run a complex multi-router setup, it is critical to use the exact IP addresses assigned to each piece of hardware to prevent the network from crashing. To access the admin portal of any router, connect your device to its Wi-Fi network and type the IP address directly into a web browser (like Safari or Chrome).

For the Dugout Hub (GL.iNet Slate 7 GL-BE3600): The IP Address is <ROUTER2_IP>. The Admin Portal Password is <ROUTER2_ADMIN>. The Wi-Fi SSID (Network Name) is <ROUTER2_SSID>, and the Wi-Fi Password is <ROUTER2_WIFI>. Hardware details: MAC <MAC>, S/N <SN>, Device ID <ID>. This router acts as the brain of the operation, connecting directly to the 5G modem.

For the Centerfield Bridge (GL.iNet Slate AX GL-AXT1800): The IP Address is <ROUTER1_IP>. The Admin Portal Password is <ROUTER1_ADMIN>. The Wi-Fi SSID is <ROUTER1_SSID>, and the Wi-Fi Password is <ROUTER1_WIFI>. Hardware details: MAC <MAC>, S/N <SN>, Device ID <ID>.

For the NearStream Camera: The designated IP address on the network is <CAM1_IP>. If the NearStream app cannot automatically discover this camera, you can use this specific IP address to manually ping and connect to it over the local network.

## How do I pull the SidelineHD Stream Keys and start the broadcast?

To start the broadcast, you must pair the camera hardware to the specific digital "destination" for that game.

Log in to your account at sidelineHD.com using the Rebels global credentials (<CLUB_EMAIL>).

On the main dashboard, select the specific Team Card for the team you are streaming today. This is crucial; selecting the wrong team will send the video to the wrong Facebook/YouTube page.

Go to Settings (the gear icon in the top right), then navigate to Stream Settings > Camera Settings.

Locate your camera preset and click the three dots (advanced settings) next to it.

Find and carefully copy the unique Stream URL and Stream Key.

Open the NearStream app on your iPad, go to the output/destination settings, select "Custom RTMP", and paste these codes exactly as they appear.

Pro Tip: Always verify there are no accidental spaces at the beginning or end of the Stream Key when you paste it, as this is the most common reason for a stream failing to connect.

## How do I link the Pocket Radar to the SidelineHD stream overlay?

Integrating pitch speeds directly into the broadcast requires a smooth digital handshake between the radar gun, the scoring phone, and the cloud.

Ensure you have the Pocket Radar Sports App downloaded on your dedicated scoring smartphone (you must be running at least v2.1.0+ for iOS, or 2.0.1+ for Android). Log in to your Pocket Radar account. In the app, click the "MORE" button, select "Pocket Radar Connect", and tap "AGREE" to allow third-party data sharing.

Crucial Step: You must background the Pocket Radar app, meaning you leave it running while you switch apps. If you completely swipe it closed, the Bluetooth connection to the radar gun will sever. Finally, open the sidelineHD platform on that same phone and authorize Pocket Radar access. If the speeds still aren't showing up, ensure your phone is not in "Low Power" or "Battery Saver" mode, which can throttle background app data. If persistent issues occur, contact Info@pocketradar.com.

## The Netgear M7 5G Modem is overheating or shutting down mid-game

5G cellular modems process massive amounts of data and generate significant heat, which becomes a critical failure point in the direct Australian sun. When a modem overheats, it will automatically shut down to protect its internal circuitry, instantly killing your live stream.

To prevent this, you must take the internal battery OUT of the Netgear M7 modem entirely before the game begins. Plug the battery-less modem directly into a high-capacity USB-C power bank (such as the UGREEN 20000mAh or INIU 10000mAh) or a USB-C wall charger if 240v power is available. You must use a high-wattage charging cable to provide enough power to run the modem directly. Without the battery inside trapping heat, the modem will run significantly cooler.

Additionally, ensure the modem is mounted high on the fence to get the best cellular reception, but securely under a shade hood, towel, or umbrella to keep it out of direct UV sunlight. Connect it via the short Ethernet cable directly to the Slate 7's 2.5G WAN port.

## The stream is buffering, freezing, or dropping frames constantly

Video buffering is rarely a camera issue; it is almost always caused by cellular network congestion (spectral efficiency degradation) when hundreds of spectators arrive at the park and their smartphones flood the local 5G tower.

Prior to hitting "Go Live", you must run a speed test (using an app like Speedtest.net) on your iPad while it is connected to the dugout Slate 7 router. Look specifically at your Upload Speed. You must manually set your NearStream camera's upload bitrate to NO MORE THAN 50% of the lowest recorded upload speed. For example, if your upload speed fluctuates between 10Mbps and 15Mbps, set your camera's broadcast bitrate to a maximum of 5Mbps. This 50% buffer ensures that when the network inevitably dips during the game, your stream has enough headroom to survive without dropping frames.

If the 5G network is bouncing wildly and failing completely, log into the Netgear M7 admin panel and manually lock the cellular band to a specific 5G frequency (e.g., n78) or force it down to a highly reliable, slower 4G LTE frequency (e.g., B28) for maximum stability.

## The tablet or phone in the Dugout cannot find the Centerfield NearStream camera

The outfield camera relies on a complex wireless bridge to send data 250+ feet back to the dugout. Because the Slate AX out in centerfield acts as a "WDS Transparent Bridge", it invisibly shares the dugout's network subnet.

If the tablet or phone cannot see the camera, first physically walk out to centerfield and check the power bank. Ensure the Slate AX router and the camera are both powered on and properly connected via the long Ethernet cable.

Second, check your line-of-sight. 5GHz and 2.4GHz Wi-Fi signals cannot penetrate human bodies or dense metal effectively. Ensure the Slate AX router (housed inside the Toolpro Safe Case) is mounted high up on the fence, ideally above head height. If walking spectators, warming up players, or thick metal poles block the physical, visual line-of-sight back to the dugout hub, the signal will sever.

## The Dugout Wi-Fi keeps disconnecting the iPad or control smartphone

Apple devices (iPads and iPhones) use a built-in privacy feature called "Private Wi-Fi Address" (also known as Randomized MAC/BSSID). This feature constantly rotates the device's digital identity to prevent tracking on public networks. However, this causes continuous, frustrating disconnects when connected to our private travel routers, as the router thinks a "new" device is constantly joining and dropping.

To fix this, go to your iPad/iPhone Wi-Fi settings, tap the blue "i" icon next to the GL-BE3600 network, and turn Private Wi-Fi Address OFF.

Additionally, ensure the Slate 7's 5GHz Wi-Fi is locked to a specific, high-power channel (e.g., Channel 149) and that "Auto Channel" is turned completely OFF. If Auto is left on, the router will periodically shut down the Wi-Fi mid-game to scan the environment for clearer frequencies, booting all your devices offline. Finally, ensure MLO (Multi-Link Operation) is OFF on the primary broadcast SSID, as legacy Apple devices often struggle to maintain a connection when MLO is active.

## The Centerfield Slate AX Router cannot see the Dugout 2.4GHz Wi-Fi Network

If you are setting up the wireless bridge and the Centerfield router simply cannot find the Dugout router during a Wi-Fi scan, you are experiencing a Wi-Fi 7 to Wi-Fi 6 hardware mismatch. The newer Slate 7 hub is broadcasting a signal too advanced for the older Slate AX to interpret.

To resolve this, log into the Slate 7 (Dugout Hub) admin panel at <ROUTER2_IP>. Navigate to the 2.4 GHz Wi-Fi settings. You must strictly change the Wi-Fi Mode to "11 b/g/n" (Legacy Wi-Fi 4) and keep the bandwidth permanently locked to 20 MHz. This effectively "dumbs down" the wireless signal so the older Slate AX can instantly recognize and bind to it.

You may also need to change the 2.4 GHz security protocol strictly to WPA2-PSK (avoiding WPA3). For maximum reliability, temporarily append "-2G" to the SSID name (e.g., GL-BE3600-cfd-2G) so the bridge router connects explicitly to the 2.4GHz band and doesn't attempt to blend into the 5GHz band.

## The WDS Bridge connects but fails to pass camera video to the tablet or phone

WDS (Wireless Distribution System) is a MAC-layer protocol that creates an invisible, seamless bridge between two routers. However, mixing different router generations (a Wi-Fi 7 Slate 7 and a Wi-Fi 6 Slate AX) can sometimes break this specific protocol, resulting in a bridge that says "Connected" but refuses to pass video data from the camera to the tablet or phone.

If WDS refuses to route your video traffic, log into the Slate AX (Centerfield) network settings and change the network mode from "WDS" to "Extender Mode" or "Repeater Mode". This turns the centerfield router into a universal "dumb switch". While it may create a double-NAT on the network, it securely forces the connection to the dugout network using standard Wi-Fi protocols without relying on the strict, proprietary hardware chipsets required by WDS.

## The cameras are shaking, rattling, or affected by high winds

Softball and baseball fields are highly susceptible to crosswinds. If cameras are shaking, the broadcast will become unwatchable and induce motion sickness for viewers.

Do not mount cameras directly to the chain-link backnets using standard magic arms or camera clamps. When a foul ball strikes the backnet, or when high winds hit the facility, the entire fence acts like a sail and vibrates violently.

Instead, you must use the heavy-duty standalone tripods provided in the kit. Set these tripods up independently behind the backnet for all primary NearStream cameras (Home Plate, 1st Base, 3rd Base). Keep the camera lens as close to the chain-link gaps as possible without touching the metal. If winds are severe, utilize gear bags or sandbags to weight down the center column of the tripods for maximum stability.

## The SidelineHD stream is Live but showing a Black Screen

If the NearStream app shows a green "Live" indicator, but the SidelineHD portal or Facebook/YouTube output is showing a black screen or an "Offline" graphic, the camera software is successfully pushing data, but not to your specific team's portal.

This is almost universally caused by a typo in the RTMP credentials. Double-check that your unique Stream URL and Stream Key from the SidelineHD portal have been copied and pasted exactly into your NearStream app's Custom RTMP destination settings. Ensure there are absolutely no trailing spaces, missing characters, or accidental line breaks at the end of the Stream Key.

## Equipment is dead on arrival at Shirley Strickland Reserve or SEMSA

Understanding your venue's power limitations is critical before unpacking the gear. Shirley Strickland and SEMSA diamonds do NOT have 240v power access at the backnets. If you only brought standard AC wall chargers, you will not be able to power the network or the stream.

For these off-grid locations, you must power the entire broadcast using the provided high-capacity USB-C power banks (such as the INIU 10000mAh and UGREEN 20000mAh units). Connect the Dugout Hub router, the 5G modem, and the Home Plate cameras to these batteries. Furthermore, you must utilize the Projecta Solar Panel for the centerfield rig to continuously trickle-charge that power bank, ensuring the remote hardware survives the entirety of a 2-hour game. (Note: Conversely, Softball WA Diamond 1 & 2 DO have 240v power available, allowing the use of standard wall plugs).

## The two GL.iNet Routers are causing IP Conflicts and taking the network down

Every router comes from the factory programmed to act as the primary gateway, generally using the IP address <ROUTER1_IP>. If both the Dugout Slate 7 and the Centerfield Slate AX are powered on and outputting their default factory IP addresses on the same bridged network, a massive IP conflict will occur, crashing the network and knocking all devices offline.

To prevent this, we have permanently modified the Dugout Hub. Ensure the Dugout Hub (Slate 7) remains permanently assigned to the IP address <ROUTER2_IP> (accessible via Admin PW <ROUTER2_ADMIN>). This intentionally moves it out of the way, avoiding fights with the Centerfield bridge (Slate AX), which should safely remain on the default <ROUTER1_IP>. If someone has factory-reset the Slate 7, you must manually log in and change its LAN IP back to <ROUTER2_IP> before attempting to connect the centerfield bridge.

## Wind noise is overpowering the umpire's calls and game audio

The built-in microphones on the NearStream cameras are highly sensitive, which means they are easily overwhelmed by wind rushing across open ovals, creating a loud, distorted rumbling on the broadcast that drowns out the umpire's calls and the crack of the bat.

To capture professional-grade audio, utilize the external NearStream wireless microphone kits (such as the AM10X or AWM20T). Clip the wireless transmitter as close to the home plate umpire as safely possible, or attach it to the fence lower down where it is sheltered by the dugout brickwork. Additionally, open the NearStream app's audio mixing interface and ensure "background noise cancellation", vocal isolation, or wind-reduction filters are actively enabled for the specific microphone input you are utilizing. Always monitor the audio visually using the decibel meters in the app to ensure it isn't "peaking" into the red zone.