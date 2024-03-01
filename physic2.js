let area = document.querySelector('.area');
let circle = document.querySelector('.circle');
let stick = document.querySelector('.stick');
let areaCoords = area.getBoundingClientRect();
let circleCoords = circle.getBoundingClientRect();
let circleXcenterWindow = circleCoords.x + circleCoords.width/2;
let circleYcenterWindow = circleCoords.y + circleCoords.height/2;
let diagonalLength = 0;
let speedHero = 1.5;
let speedAutoMove = speedHero / 2.5;
let speedProcess = speedHero * 6.5;
let dx;
let dy;

// START шаблон для персонажей
class Persona {
  // {x, y, width, height, background, radius, classHtml, rotate}
  constructor (options) {
    this.options = options;
    this.person = this.create(this.options.x, this.options.y);
    this.x = options.x;
    this.y = options.y;
    this.rotate = options.rotate || 270;
  }
  create(x, y) {
    let person = document.createElement('div');
    person.classList.add(`${this.options.clas}`)
    person.style.cssText = `position:absolute; width: ${this.options.width || 10}px; height: ${this.options.height || 10}px; background: ${this.options.background || "red"}; border-radius: ${this.options.radius || 3}px; left: ${x}px; top: ${y}px; transform: rotate(${this.options.rotate || 270}deg)`;
    area.insertAdjacentElement('afterbegin', person)
    return person;
  }
  move(x, y) {
    if (this.x + this.options.width > areaCoords.right) {
      this.x = areaCoords.right - this.options.width;
    } 
    if (this.x - areaCoords.left < areaCoords.left) {
      this.x = 0;
    }
    if (this.y - areaCoords.top < areaCoords.top) {
      this.y = 0;
    }
    if (this.y + this.options.height > areaCoords.bottom) {
      this.y = areaCoords.bottom - this.options.height;
    } 
    
    this.x += x * speedHero;
    this.y += y * speedHero;
    
    this.person.style.left = this.x + 'px';
    this.person.style.top = this.y + 'px';
  }
  rotateAngle(angle) {
    this.rotate += angle - this.rotate;
    this.person.style.transform = `rotate(${this.rotate}deg)`;
  }
}
// END шаблон для персонажей

// create hero
let hero = new Persona({x: area.offsetWidth/2 - 10, y: area.offsetHeight/2 - 10, width: 30, height: 30, background: "lawngreen", radius: 5, clas: "hero"});
let eyes = document.createElement('div');
eyes.innerHTML = ':';
eyes.classList.add('eyes');
hero.person.insertAdjacentElement('afterbegin', eyes);

// create enemy
let enemy = new Persona({x: 100, y: 200, width: 30, height: 30, background: "orange", radius: 1, clas: "enemy"});

enemy.create(30, 40);
enemy.create(260, 10);

function calculateDiagonal (x, y) {
  let a = Math.abs(x - circleXcenterWindow);
  let b = Math.abs(y - circleYcenterWindow);
  diagonalLength = Math.sqrt(a*a + b*b);
}

function heroStickMove (x, y) {
  dx = x - circleXcenterWindow;
  dy = y - circleYcenterWindow;
  
  let catangens = Math.atan2(dy, dx);
  let heroDx = Math.cos(catangens) * speedAutoMove;
  let heroDy = Math.sin(catangens) * speedAutoMove;
  
  return [heroDx, heroDy, catangens];
}

function calculateAngleHero (catangens) {
  let angle = (catangens * 180) / Math.PI;
  if (angle < 0) angle += 360;
  
  hero.rotateAngle(angle);
}

function calculateStickMove (x, y, catangens) {
  let dr = circle.offsetWidth/2 - stick.offsetWidth/2;
  if (diagonalLength < 50) {
    // calculate new coords stick
    dx = x - circleCoords.x - stick.offsetWidth / 2;
    dy = y - circleCoords.y - stick.offsetHeight / 2;
  } else {
    dx = Math.cos(catangens)*dr + dr;
    dy = Math.sin(catangens)*dr + dr;
  } 
  
  stick.style.left = dx + 'px';
  stick.style.top = dy + 'px';
}

// процесс
let process;
process = setInterval(() => {
  // если стик упирается в окружность, то включаем автоход герою
  if (diagonalLength >= 50) {
    let stickCoords = stick.getBoundingClientRect();
    
    [heroDx, heroDy] = heroStickMove (stickCoords.x + stickCoords.width/2, stickCoords.y + stickCoords.height/2);
    
    hero.move(heroDx, heroDy);
  }
}, speedProcess)

// events listener
  stick.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
   
    [heroDx, heroDy, catangens] = heroStickMove(touch.clientX, touch.clientY);
    ////////////
    calculateDiagonal (touch.clientX, touch.clientY)
    calculateAngleHero (catangens);
    calculateStickMove (touch.clientX, touch.clientY, catangens);
    ////////////
    if (diagonalLength < 50) {
      hero.move(heroDx, heroDy);
    }
  })

stick.addEventListener('touchend', (event) => {
    event.preventDefault();
    stick.style.left = circle.offsetWidth/2 - stick.offsetWidth/2 + 'px';
    stick.style.top = circle.offsetHeight/2 - stick.offsetHeight/2 + 'px';
    
    diagonalLength = 0;
})
/*
area.addEventListener('pointerdown', (event) =>  {
  let el = document.elementFromPoint(event.x, event.y);
  if (el.closest(".enemy") || el.closest(".hero")) el.remove();
  event.preventDefault();
});
*/
