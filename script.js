let area = document.querySelector('.area');
let circle = document.querySelector('.circle');
let stick = document.querySelector('.stick');
let areaCoords = area.getBoundingClientRect();
let circleCoords = circle.getBoundingClientRect();

// START шаблон для персонажей
class Persona {
  // {x, y, width, height, background, radius, classHtml}
  constructor (options) {
    this.options = options;
    this.person = this.create(this.options.x, this.options.y);
    this.x = options.x;
    this.y = options.y;
  }
   get metrics () {
      return this.person.getBoundingClientRect();
    }
  create(x, y) {
    let person = document.createElement('div');
    person.classList.add(`${this.options.clas}`)
    person.style.cssText = `position:absolute; width: ${this.options.width || 10}px; height: ${this.options.height || 10}px; background: ${this.options.background || "red"}; border-radius: ${this.options.radius || 3}px; left: ${x}px; top: ${y}px`;
    area.insertAdjacentElement('afterbegin', person)
    return person;
  }
  move(x, y) {
    
    if (x + this.metrics.width + 10 > areaCoords.right) {
      x = areaCoords.right - this.metrics.width - 10;
    } 
    if (x - areaCoords.left + 15 < areaCoords.left) {
      x = 0;
    }
    if (y - areaCoords.top + 15 < areaCoords.top) {
      y = 0;
    }
    if (y + this.metrics.height + 10 > areaCoords.bottom) {
      y = areaCoords.bottom - this.metrics.height - 10;
    } 
    
    this.x = x;
    this.y = y;
    
    this.person.style.left = this.x + 'px';
    this.person.style.top = this.y + 'px';
  }
}
// END шаблон для персонажей

// create hero
let hero = new Persona({x: area.offsetWidth/2 - 10, y: area.offsetHeight/2 - 10, width: 30, height: 30, background: "lawngreen", radius: 5, clas: "hero"});
hero.person.style.transition = '0.03s';
let heroCssStyles = getComputedStyle(hero.person);
let heroWidth = parseInt(heroCssStyles.width);
let heroHeight = parseInt(heroCssStyles.height);

// create enemy
let enemy = new Persona({x: 100, y: 200, width: 30, height: 30, background: "orange", radius: 1, clas: "enemy"});

enemy.create(30, 40);
enemy.create(260, 10);

// START move stick
let circleXcenter = circle.offsetWidth/2;
let circleYcenter = circle.offsetHeight/2;
let circleXcenterWindow = circleCoords.x + circleCoords.width/2;
let circleYcenterWindow = circleCoords.y + circleCoords.height/2;
let stickXcenter = null;
let stickYcenter = null;

// вычисляем длинну стика от центра
function calculateDiagonalLength(x1, y1, x2, y2) {
  
    const a = Math.abs(x2 - x1);
    const b = Math.abs(y2 - y1);
    
    const diagonalLength = Math.sqrt(a*a + b*b);
   
    return [diagonalLength];
}
let diagonalLength;
let angle;

// берем начальные координаты при прикосновении с областью стика, чтобы сделать их нулевыми для дальнейшего приcваивания координатам героя
let startX;
let startY;
// получаем конечные координаты героя при отпускании стика, чтобы герой оставался на том же месте после нового движения стика
let endX = 0;
let endY = 0;

function moveStick (eventX, eventY) {
  // get metrics stick
  let stickCoords = stick.getBoundingClientRect();
  
  // calculate diagonal length and angle
  [diagonalLength, angle] = calculateDiagonalLength(circleXcenterWindow, circleYcenterWindow, eventX, eventY);
  
  // с помощью тригонометрии получаем координатв окружности
  let dr = circle.offsetWidth/2 - stick.offsetWidth/2;
  let dy = eventY - circleYcenterWindow;
  let dx = eventX - circleXcenterWindow;
  if (diagonalLength < 50) {
    // calculate new coords stick
    dx = eventX - circleCoords.x - stickCoords.width / 2;
    dy = eventY - circleCoords.y - stickCoords.width / 2;
  } else {
    let a = Math.atan2(dy, dx);
    dx = Math.cos(a)*dr + dr;
    dy = Math.sin(a)*dr + dr;
  } 
 
 // новые вычесленные координаты стика
  stick.style.left = dx + 'px';
  stick.style.top = dy + 'px';
  
  // перемещение героя
  hero.move(eventX - startX + endX + area.offsetWidth/2 - heroWidth/2, eventY - startY + endY + area.offsetHeight/2 - heroHeight/2);
}
// END move stick

// events listener
circle.addEventListener('touchstart', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
    startX = touch.clientX; 
    startY = touch.clientY;
    stick.style.left = touch.clientX - circleCoords.x - stick.offsetWidth/2 + 'px';
    stick.style.top = touch.clientY - circleCoords.y - stick.offsetHeight/2 + 'px';
})

  circle.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
    moveStick(touch.clientX, touch.clientY);
  })

circle.addEventListener('touchend', (event) => {
    event.preventDefault();
    stick.style.left = circleXcenter - stick.offsetWidth/2 + 'px';
    stick.style.top = circleYcenter - stick.offsetHeight/2 + 'px';
    
    endX = hero.x - area.offsetWidth/2 + heroWidth/2;
    endY = hero.y - area.offsetHeight/2 + heroHeight/2;
    diagonalLength = 0;
})
/*
area.addEventListener('pointerdown', (event) =>  {
  let el = document.elementFromPoint(event.x, event.y);
  if (el.closest(".enemy") || el.closest(".hero")) el.remove();
  event.preventDefault();
});
*/
        
