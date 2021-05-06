var numpad = {
  // (A) CREATE NUMPAD HTML
  hwrap: null, // numpad wrapper container
  hpad: null, // numpad itself
  hdisplay: null, // number display
  hbwrap: null, // buttons wrapper
  hbuttons: {}, // individual buttons
  init: function(){
    // (A1) WRAPPER
    numpad.hwrap = document.createElement("div");
    numpad.hwrap.id = "numWrap";

    // (A2) ENTIRE NUMPAD ITSELF
    numpad.hpad = document.createElement("div");
    numpad.hpad.id = "numPad";
    numpad.hwrap.appendChild(numpad.hpad);
    
    // (A3) DISPLAY
    numpad.hdisplay = document.createElement("input");
    numpad.hdisplay.id = "numDisplay";
    numpad.hdisplay.type = "text";
    numpad.hdisplay.disabled = true;
    numpad.hdisplay.value = "0";
    numpad.hpad.appendChild(numpad.hdisplay);

    // (A4) NUMBER BUTTONS
    numpad.hbwrap = document.createElement("div");
    numpad.hbwrap.id = "numBWrap";
    numpad.hpad.appendChild(numpad.hbwrap);

    // (A5) BUTTONS
    let buttonator = function (txt, css, fn) {
      let button = document.createElement("div");
      button.innerHTML = txt;
      button.classList.add(css);
      button.addEventListener("click", fn);
      numpad.hbwrap.appendChild(button);
      numpad.hbuttons[txt] = button;
    };
    // 7 to 9
    for (let i=7; i<=9; i++) { buttonator(i, "num", numpad.digit); }
    // Backspace
    buttonator("&#10502;", "del", numpad.delete);
    // 4 to 6
    for (let i=4; i<=6; i++) { buttonator(i, "num", numpad.digit); }
    // Clear
    buttonator("C", "clr", numpad.reset);
    // 1 to 3
    for (let i=1; i<=3; i++) { buttonator(i, "num", numpad.digit); }
    // Cancel
    buttonator("&#10006;", "cx", numpad.hide);
    // 0
    buttonator(0, "zero", numpad.digit);
    // .
    buttonator(".", "dot", numpad.dot);
    // OK
    buttonator("&#10004;", "ok", numpad.select);

    // (A6) ATTACH NUMPAD TO HTML BODY
    document.body.appendChild(numpad.hwrap);
  },

  // (B) BUTTON ACTIONS
  // (B1) CURRENTLY SELECTED FIELD + MAX LIMIT
  nowTarget: null, // Current selected input field
  nowMax: 0, // Current max allowed digits
  
  // (B2) NUMBER (0 TO 9)
  digit: function(){
    let current = numpad.hdisplay.value,
        append = this.innerHTML;
    if (current.length < numpad.nowMax) {
      if (current=="0") {
        numpad.hdisplay.value = append;
      } else {
        numpad.hdisplay.value += append;
      }
    }
  },

  // (B3) ADD DECIMAL POINT
  dot: function(){
    if (numpad.hdisplay.value.indexOf(".") == -1) {
      if (numpad.hdisplay.value=="0") {
        numpad.hdisplay.value = "0.";
      } else {
        numpad.hdisplay.value += ".";
      }
    }
  },

  // (B4) BACKSPACE
  delete: function(){
    var length = numpad.hdisplay.value.length;
    if (length == 1) { numpad.hdisplay.value = 0; }
    else { numpad.hdisplay.value = numpad.hdisplay.value.substring(0, length - 1); }
  },

  // (B5) CLEAR ALL
  reset: function(){ numpad.hdisplay.value = "0"; },

  // (B6) OK - SET VALUE
  select: function(){
    numpad.nowTarget.value = numpad.hdisplay.value;
    numpad.hide();
  },

  // (C) ATTACH NUMPAD TO INPUT FIELD
  attach: function(opt){
  // OPTIONS
  //  target: required, ID of target field.
  //  max: optional, maximum number of characters. Default 255.
  //  decimal: optional, allow decimal? Default true.

    // (C1) DEFAULT OPTIONS
    if (opt.max === undefined) { opt.max = 255; }
    if (opt.decimal === undefined) { opt.decimal = true; }
    
    // (C2) GET + SET TARGET OPTIONS
    let target = document.getElementById(opt.target);
    target.readOnly = true;
    target.dataset.max = opt.max;
    target.dataset.decimal = opt.decimal;
    target.addEventListener("click", numpad.show);
  },

  // (D) SHOW NUMPAD
  show: function() {
    // (D1) SET CURRENT DISPLAY VALUE
    let cv = this.value;
    if (cv == "") { cv = "0"; }
    numpad.hdisplay.value = cv;

    // (D2) SET MAX ALLOWED CHARACTERS
    numpad.nowMax = this.dataset.max;

    // (D3) SET DECIMAL
    if (this.dataset.decimal == "true") {
      numpad.hbwrap.classList.remove("noDec");
    } else {
      numpad.hbwrap.classList.add("noDec");
    }

    // (D4) SET CURRENT TARGET
    numpad.nowTarget = this;

    // (D5) SHOW NUMPAD
    numpad.hwrap.classList.add("open"); 
  },

  // (E) HIDE NUMPAD
  hide: function(){ numpad.hwrap.classList.remove("open"); },
};
window.addEventListener("DOMContentLoaded", numpad.init);