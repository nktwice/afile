const { app, BrowserWindow } = require('electron');
const path = require('path');
const { dialog } = require('electron')
const fs = require('fs');

function austonCip (a){
  var b = a.toString(2).padStart(8, "0");
  var mask = (Math.pow(2,b.length)-1);
  b = (~a & mask).toString(2).padStart(8, "0");
return parseInt(b,2);
}
// "start": "electron-forge start",
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title : "afile",
    width: 700,
    height: 750,
    autoHideMenuBar : false,
    webPreferences: {
      nodeIntegration: true,
      devTools : false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

//Listen close event to show dialog message box

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //darwin == 'mac'
  //win32 == 'windows' 
  // if (process.platform !== 'darwin') {
  //   app.quit(); 
  // }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
var ipc = require('electron').ipcMain;

ipc.on('create-file', function(event, data){
    var dt = data[0];
    const d = new Date(dt.DATE);
    const dtf = new Intl.DateTimeFormat('en', { year: '2-digit', month: 'short', day: '2-digit' });
    const dtflong = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
    const [{ value: MMM },,{ value: DD },,{ value: YY }] = dtf.formatToParts(d);
    const [{ value: Mouth },,{ value: Day },,{ value: YYYY }] = dtflong.formatToParts(d);

    const ct = {
      typ : dt.FILE_TYPE,
      cus : dt.CUS_NAME,
      isl : dt.INST_ID,
      cid : dt.CIRC_ID,
      lid : dt.LINK_ID,
      lpw : dt.LINK_ID.slice(Math.ceil(dt.LINK_ID.length/2)*(-1)) + dt.LINK_ID.slice(0,Math.floor(dt.LINK_ID.length/2)) + MMM.toLocaleUpperCase(),
      wan : {
        def : `${dt.WAN_IP.A}.${dt.WAN_IP.B}.${dt.WAN_IP.C}.${dt.WAN_IP.D}`,
        aaa : `${dt.WAN_IP.A}.${dt.WAN_IP.B}.${dt.WAN_IP.C}.${dt.WAN_IP.D +1}`,
        bbb : `${dt.WAN_IP.A}.${dt.WAN_IP.B}.${dt.WAN_IP.C}.${dt.WAN_IP.D +2}`,
        snm : `${dt.WAN_IP_SNM.A}.${dt.WAN_IP_SNM.B}.${dt.WAN_IP_SNM.C}.${dt.WAN_IP_SNM.D}`,
        cip : `0.0.0.${austonCip(dt.WAN_IP_SNM.D)}`
      },
      lan : {
        def : `${dt.LAN_IP.A}.${dt.LAN_IP.B}.${dt.LAN_IP.C}.${dt.LAN_IP.D}`,
        aaa : `${dt.LAN_IP.A}.${dt.LAN_IP.B}.${dt.LAN_IP.C}.${dt.LAN_IP.D +1}`,
        bbb : `${dt.LAN_IP.A}.${dt.LAN_IP.B}.${dt.LAN_IP.C}.${dt.LAN_IP.D +2}`,
        snm : `${dt.LAN_IP_SNM.A}.${dt.LAN_IP_SNM.B}.${dt.LAN_IP_SNM.C}.${dt.LAN_IP_SNM.D}`,
        cip : `0.0.${austonCip(dt.LAN_IP_SNM.C)}.${austonCip(dt.LAN_IP_SNM.D)}`
      },
      itn : {
        def : `${dt.ITN_IP.A}.${dt.ITN_IP.B}.${dt.ITN_IP.C}.${dt.ITN_IP.D}`,
        aaa : `${dt.ITN_IP.A}.${dt.ITN_IP.B}.${dt.ITN_IP.C}.${dt.ITN_IP.D +1}`,
        bbb : `${dt.ITN_IP.A}.${dt.ITN_IP.B}.${dt.ITN_IP.C}.${dt.ITN_IP.D +2}`,
        snm : `${dt.ITN_IP_SNM.A}.${dt.ITN_IP_SNM.B}.${dt.ITN_IP_SNM.C}.${dt.ITN_IP_SNM.D}`,
        cip : `0.0.${austonCip(dt.ITN_IP_SNM.C)}.${austonCip(dt.ITN_IP_SNM.D)}`
      }
    }
    dialog.showOpenDialog({properties: ['openDirectory']})
      .then(result=> {
        var fname = `${ct.lid}_${ct.cus}_CONFIG_${DD}${MMM.toUpperCase()}${YY}.txt`;
        var fcontent;
        switch(ct.typ){
          case "NOR" :
            fcontent = `version 12.x
service timestamps log datetime msec localtime 
service timestamps debug datetime msec localtime
service password-encryption
!
hostname ${ct.cus}
!
logging buffered 20000
!
enable secret csl0x!nf0
!
!
clock timezone TH 7
ip cef
ip subnet-zero
ip name-server 203.146.237.237
ip name-server 203.146.237.222
!
username ${ct.lid} password ${ct.lpw}
username csl password csloxinfo
!
interface Tunnel0
 description Check status link Ethernet
 ip unnumbered FastEthernet0/0
 tunnel source ${ct.wan.bbb}
 tunnel destination ${ct.wan.aaa}
!
interface FastEthernet0/0
 description Connect to CS Loxinfo via AWN Ethernet CID:${ct.cid},LinkID:${ct.lid},${MMM}${DD},${YYYY}:${ct.isl}
 ip address ${ct.wan.bbb} ${ct.wan.snm}
 no ip redirects
 no ip proxy-arp
 speed 100
 full-duplex
!
interface FastEthernet0/1
 description Internal Network
 ip address ${ct.lan.def} ${ct.lan.snm}
 no ip redirects
!
no ip http server
ip classless
ip route 0.0.0.0 0.0.0.0 ${ct.wan.aaa} name Default_Route
!
access-list 10 remark Access Router
access-list 10 permit 203.146.64.3
access-list 10 permit 203.146.64.39
access-list 10 permit 203.146.103.37
access-list 10 permit 210.1.27.59
access-list 10 permit ${ct.wan.def} ${ct.wan.cip}
access-list 10 permit ${ct.lan.def} ${ct.lan.cip}
!
!
line con 0
line aux 0
line vty 0 4
 access-class 10 in
 login local
!
ntp server 203.146.30.185
end`;
break;
          case "DHCP" :
            fcontent = `version 12.x
service timestamps log datetime msec localtime 
service timestamps debug datetime msec localtime
service password-encryption
!
hostname ${ct.cus}
!
logging buffered 20000
!
enable secret csl0x!nf0
!
!
clock timezone TH 7
ip cef
ip subnet-zero
ip name-server 203.146.237.237
ip name-server 203.146.237.222
ip dhcp excluded-address ${ct.itn.aaa}
!
!
!
ip dhcp pool clients
   network ${ct.itn.def} ${ct.itn.snm}
   default-router ${ct.itn.aaa}
   dns-server 203.146.237.237 203.146.237.222
!
!
username ${ct.lid} password ${ct.lpw}
username csl password csloxinfo
!
interface Tunnel0
 description Check status link Ethernet
 ip unnumbered FastEthernet0/0
 tunnel source ${ct.wan.bbb}
 tunnel destination ${ct.wan.aaa}
!
interface FastEthernet0/0
 description Connect to CS Loxinfo via Symphony/ADC/... Ethernet CID:${ct.cid},LinkID:${ct.lid},${MMM}${DD},${YYYY}:${ct.isl}
 ip address ${ct.wan.bbb} ${ct.wan.snm}
 no ip redirects
 no ip proxy-arp
 ip nat outside
 speed 100
 full-duplex
!
interface FastEthernet0/1
 description Internal Network
 ip address ${ct.itn.aaa} ${ct.itn.snm}
 ip address ${ct.lan.def} ${ct.lan.snm} secondary
 no ip redirects
 ip nat inside
 speed 100
 full-duplex
!
ip nat pool clients ${ct.lan.def} ${ct.lan.def} netmask ${ct.lan.snm}
ip nat inside source list 1 pool clients overload
no ip http server
ip classless
ip route 0.0.0.0 0.0.0.0 ${ct.wan.aaa} name Default_Route
!
access-list 1 remark NAT Clients
access-list 1 permit 192.168.0.0 0.0.0.255
access-list 10 remark Access Router
access-list 10 permit 203.146.64.3
access-list 10 permit 203.146.64.39
access-list 10 permit 203.146.103.37
access-list 10 permit 210.1.27.59
access-list 10 permit ${ct.wan.def} ${ct.wan.cip}
access-list 10 permit ${ct.lan.def} ${ct.lan.cip}
!
!
line con 0
line aux 0
line vty 0 4
 access-class 10 in
 login local
!
ntp server 203.146.30.185
end`;    
break;
          case "NAT" :
            fcontent = `version 12.x
service timestamps log datetime msec localtime 
service timestamps debug datetime msec localtime
service password-encryption
!
hostname ${ct.cus}
!
logging buffered 20000
!
enable secret csl0x!nf0
!
!
clock timezone TH 7
ip cef
ip subnet-zero
ip name-server 203.146.237.237
ip name-server 203.146.237.222
!
username ${ct.lid} password ${ct.lpw}
username csl password csloxinfo
!
interface Tunnel0
 description Check status link Ethernet
 ip unnumbered FastEthernet0/0
 tunnel source ${ct.wan.bbb}
 tunnel destination ${ct.wan.aaa}
!
interface FastEthernet0/0
 description Connect to CS Loxinfo via Symphony/ADC/... Ethernet CID:${ct.cid},LinkID:${ct.lid},${MMM}${DD},${YYYY}:${ct.isl}
 ip address ${ct.wan.bbb} ${ct.wan.snm}
 no ip redirects
 no ip proxy-arp
 ip nat outside
 speed 100
 full-duplex
!
interface FastEthernet0/1
 description Internal Network
 ip address ${ct.itn.aaa} ${ct.itn.snm}
 ip address ${ct.lan.def} ${ct.lan.snm} secondary
 no ip redirects
 ip nat inside
 speed 100
 full-duplex
!
ip nat pool clients ${ct.lan.def} ${ct.lan.def} netmask ${ct.lan.snm}
ip nat inside source list 1 pool clients overload
no ip http server
ip classless
ip route 0.0.0.0 0.0.0.0 ${ct.wan.aaa} name Default_Route
!
access-list 1 remark NAT Clients
access-list 1 permit 192.168.0.0 0.0.0.255
access-list 10 remark Access Router
access-list 10 permit 203.146.64.3
access-list 10 permit 203.146.64.39
access-list 10 permit 203.146.103.37
access-list 10 permit 210.1.27.59
access-list 10 permit ${ct.wan.def} ${ct.wan.cip}
access-list 10 permit ${ct.lan.def} ${ct.lan.cip}
!
!
line con 0
line aux 0
line vty 0 4
 access-class 10 in
 login local
!
ntp server 203.146.30.185
end`;
break;
        }
        fs.writeFile(`${result.filePaths}/${fname}`, fcontent, function(err) {
          if(err) {
            console.log(`writeFile : ${err}`);
            console.log(dialog.showErrorBox("Something went wrong!", err))
            return;
          } else {
            console.log(`The file was saved! ${fname}`);
            console.log(dialog.showMessageBox({
              type: 'info',
              buttons: ['OK'],
              title: "Success",
              message: `The file was saved!`,
              detail: `${fname}`
             }))
          }
        }); 
  });
});
