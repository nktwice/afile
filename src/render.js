const {ipcRenderer} = require('electron');
const flatpickr = require("flatpickr");
const { dialog } = require('electron').remote;
flatpickr(document.getElementById("my-date"), {
    enableTime: false,
    dateFormat: "d.m.Y",
    allowInput : true
})

document.getElementById('createFile').addEventListener('click', () => {
   if(document.forms[0].reportValidity()){ipcRenderer.send('create-file',prepJson());}
});

function offInternal() {
    var name = "uk-hidden";
    var e1 = document.getElementById("internal1");
    var e2 = document.getElementById("internal2");
    if (e1.className.split(" ").indexOf(name) == -1) {
        e1.className += " " + name;
        e2.className += " " + name;
    }}
function onInternal() {
    var e1 = document.getElementById("internal1");
    var e2 = document.getElementById("internal2");
    e1.className = e1.className.replace(/\buk-hidden\b/g, "");
    e2.className = e2.className.replace(/\buk-hidden\b/g, "");
}
function prepJson(){
    const inEnet = [{
        DATE : document.getElementById("my-date")._flatpickr.selectedDates,
        FILE_TYPE : document.getElementById('NOR').classList.contains("uk-active")? "NOR" : 
                    document.getElementById('DHCP').classList.contains("uk-active")? "DHCP" : "NAT" ,
        CUS_NAME :document.getElementById('cus-name').value.replace(' ','_'),         
        INST_ID : document.getElementById('installer').value,
        CIRC_ID : document.getElementById('cir-id').value,       
        LINK_ID : document.getElementById('link-id').value,
        WAN_IP : {
            "A": parseInt(document.getElementById('wan-a').value), 
            "B": parseInt(document.getElementById('wan-b').value), 
            "C": parseInt(document.getElementById('wan-c').value), 
            "D": parseInt(document.getElementById('wan-d').value)
        },
        WAN_IP_SNM : {
            "A": parseInt(document.getElementById('wan-snm-a').value), 
            "B": parseInt(document.getElementById('wan-snm-b').value), 
            "C": parseInt(document.getElementById('wan-snm-c').value), 
            "D": parseInt(document.getElementById('wan-snm-d').value)
        },  
        LAN_IP : {
            "A": parseInt(document.getElementById('lan-a').value), 
            "B": parseInt(document.getElementById('lan-b').value), 
            "C": parseInt(document.getElementById('lan-c').value), 
            "D": parseInt(document.getElementById('lan-d').value)
        }, 
        LAN_IP_SNM : {
            "A": parseInt(document.getElementById('lan-snm-a').value), 
            "B": parseInt(document.getElementById('lan-snm-b').value), 
            "C": parseInt(document.getElementById('lan-snm-c').value), 
            "D": parseInt(document.getElementById('lan-snm-d').value)
        }, 
        ITN_IP : {
            "A": parseInt(document.getElementById('itn-a').value), 
            "B": parseInt(document.getElementById('itn-b').value), 
            "C": parseInt(document.getElementById('itn-c').value), 
            "D": parseInt(document.getElementById('itn-d').value)
        }, 
        ITN_IP_SNM : {
            "A": parseInt(document.getElementById('itn-snm-a').value), 
            "B": parseInt(document.getElementById('itn-snm-b').value), 
            "C": parseInt(document.getElementById('itn-snm-c').value), 
            "D": parseInt(document.getElementById('itn-snm-d').value)
        } 
      }];
    return inEnet;

}
