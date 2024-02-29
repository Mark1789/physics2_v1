let area = document.querySelector('.area');
let circle = document.querySelector('.circle');
let stick = document.querySelector('.stick');
let areaCoords = area.getBoundingClientRect();
let circleCoords = circle.getBoundingClientRect();
let circleXcenterWindow = circleCoords.x + circleCoords.width/2;
let circleYcenterWindow = circleCoords.y + circleCoords.height/2;
let speedHero = 1.5;
let speedAutoMove = speedHero / 2.5;
let speedProcess = speedHero * 6.5;

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
   get metrics () {
      return this.person.getBoundingClientRect();
    }
  create(x, y) {
    let person = document.createElement('div');
    person.classList.add(`${this.options.clas}`)
    person.style.cssText = `position:absolute; width: ${this.options.width || 10}px; height: ${this.options.height || 10}px; background: ${this.options.background || "red"}; border-radius: ${this.options.radius || 3}px; left: ${x}px; top: ${y}px; transform: rotate(${this.options.rotate || 270}deg)`;
    area.insertAdjacentElement('afterbegin', person)
    return person;
  }
  move(x, y) {
    if (this.x + this.metrics.width > areaCoords.right) {
      this.x = areaCoords.right - this.metrics.width;
    } 
    if (this.x - areaCoords.left + 15 < areaCoords.left) {
      this.x = 1;
    }
    if (this.y - areaCoords.top + 15 < areaCoords.top) {
      this.y = 1;
    }
    if (this.y + this.metrics.height > areaCoords.bottom) {
      this.y = areaCoords.bottom - this.metrics.height;
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
let heroCssStyles = getComputedStyle(hero.person);
let heroWidth = parseInt(heroCssStyles.width);
let heroHeight = parseInt(heroCssStyles.height);
let eyes = document.createElement('div');
eyes.innerHTML = ':';
eyes.classList.add('eyes');
hero.person.insertAdjacentElement('afterbegin', eyes);

// create enemy
let enemy = new Persona({x: 100, y: 200, width: 30, height: 30, background: "orange", radius: 1, clas: "enemy"});

enemy.create(30, 40);
enemy.create(260, 10);

let diagonalLength;

// все расчёты стика и героя
function calculateAngle(x, y) {
  
  let stickCoords = stick.getBoundingClientRect();
 
  // вычисляем длинну диагонали от центра circle до центра касания пальца по стику
  const a = Math.abs(x - circleXcenterWindow);
  const b = Math.abs(y - circleYcenterWindow);
  diagonalLength = Math.sqrt(a*a + b*b);
  
  // с помощью тригонометрии получаем координатв окружности
  let dr = circle.offsetWidth/2 - stick.offsetWidth/2;
  let dx = x - circleXcenterWindow;
  let dy = y - circleYcenterWindow;
  
  // высисляем катангенс и координаты для перемещения героя
  let catangens = Math.atan2(dy, dx);
  let heroDx = Math.cos(catangens);
  let heroDy = Math.sin(catangens);
  // угол поворота для героя
  let angle = (catangens * 180) / Math.PI;
  if (angle < 0) angle += 360;
  hero.rotateAngle(angle);
  
  if (diagonalLength < 50) {
    // calculate new coords stick
    dx = x - circleCoords.x - stickCoords.width / 2;
    dy = y - circleCoords.y - stickCoords.width / 2;
  } else {
    dx = Math.cos(catangens)*dr + dr;
    dy = Math.sin(catangens)*dr + dr;
  } 
  
  stick.style.left = dx + 'px';
  stick.style.top = dy + 'px';
  
  return [heroDx, heroDy];
}

function heroAutoMove (x, y) {
  let dx = x - circleXcenterWindow;
  let dy = y - circleYcenterWindow;
  
  let catangens = Math.atan2(dy, dx);
  let heroDx = Math.cos(catangens) * speedAutoMove;
  let heroDy = Math.sin(catangens) * speedAutoMove;
  
  return [heroDx, heroDy];
}

// процесс
let process;
process = setInterval(() => {
  // если стик упирается в окружность, то включаем автоход герою
  if (diagonalLength >= 50) {
    let stickCoords = stick.getBoundingClientRect();
    
    [heroDx, heroDy] = heroAutoMove (stickCoords.x + stickCoords.width/2, stickCoords.y + stickCoords.height/2);
    
    hero.move(heroDx, heroDy);
  }
}, speedProcess)

// events listener
  stick.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
   
    [heroDx, heroDy] = calculateAngle(touch.clientX, touch.clientY);
    
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
