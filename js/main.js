

let event_holder = [
  {text: 'New event', date: '25', month: 'Nov', year: '2018', starred: true, id: 0},
  {text: 'Hit the gym', date: '18', month: 'Dec', year: '2018', starred: false, id: 1},
  {text: 'December 3rd', date: '03', month: 'Dec', year: '2018', starred: false, id: 2},
  {text: 'October 1', date: '01', month: 'Oct', year: '2018', starred: true, id: 3},
  { text: 'Merry Christmas my people', date: '25', month: 'Dec', year: '2018', starred: true, id: 4 }
]

let months = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"];
let shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// let weeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
let shortweeks = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

let id_name = 'cal-id',
    item_name = 'cal-item',

    storedId = localStorage.getItem(id_name),
    storedItem = JSON.parse(localStorage.getItem(item_name));

function Cal() {

  this.today = new Date(),
  this.currentDate = this.today.getDate(),
  this.currentMonth = this.today.getMonth(),
  this.currentYear = this.today.getFullYear();
  this.new_event_btn =  document.querySelector('.new-event-btn span');
  this.ok_event_btn = document.querySelector('.ok-event-btn');

  this.new_event_btn.addEventListener('click', this.addNewEvent);
  this.ok_event_btn.addEventListener('click', this.OkEventBtn);

  this.data = {
    eventList: storedItem || event_holder,
    newId: parseInt(storedId) || 5
  }

  this.template(this.currentDate, this.currentMonth, this.currentYear);
  this.getDaysInPrevMonth(this.currentYear, this.currentMonth);
  this.getDaysInNextMonth();
  this.dateClicked();
  this.updateEventHeader();
  this.event_add();
  this.checkForValidEvent();
  // this.update();

}

Cal.prototype.template = function(d,m,y) {

  let date = 1,
      firstDay = (new Date(y, m)).getDay(),
      daysInMonth = 32 - new Date(y, m, 32).getDate(),
      calendar = document.querySelector('.calendar');

      

  calendar.innerHTML = '';
  let template = '';
  template += `
    <div class="calendar-overlay"></div>
    <div class="nav">
      <span class="left-arrow arrow" onclick="c.prevMonth()"><i class="ion-chevron-left"></i></span>
      <span class="month">
        ${months[m]} ${y}
      </span>
      <span class="rigt-arrow arrow" onclick="c.nextMonth()"><i class="ion-chevron-right"></i></span>
    </div>
    <div class="days">
      ${shortweeks.map((week)=> `<span>${week}</span>`).join('')}
    </div>
  `
  
  calendar.innerHTML += template;

  let board = document.createElement('div');
  board.className += 'board';
  calendar.appendChild(board);

  for (let i = 0; i < 6; i++) {
    let row = document.createElement('div');
    row.className += 'row';

    for (let j = 0; j < 7; j++) {
      let cell = document.createElement('div');
      cell.className += 'cell';
      row.appendChild(cell);

      if (i === 0 && j < firstDay) {
        cell.setAttribute('data-month', (m === 0) ? 11 : m - 1);
        cell.setAttribute('data-year', (m === 0) ? y - 1 : y);
        cell.classList.add('jump-to-prevMonth');
        cell.innerText = '';
      }else if (date > daysInMonth) {
        cell.setAttribute('data-month', (m + 1) % 12);
        cell.setAttribute('data-year', (m === 11) ? y + 1 : y)
        cell.classList.add('jump-to-nextMonth');
        cell.innerText = '';
      }else {
        cell.setAttribute('data-month', m);
        cell.setAttribute('data-year', y);
        cell.classList.add('current-month');
        cell.innerText = date < 10 ? '0' + date : date;

        if (date == new Date().getDate() &&
            y == new Date().getFullYear() &&
            m == new Date().getMonth()) {
              cell.classList.add('active-date');
              cell.classList.add('active-click');
        }

        if (date == d) {
          cell.classList.add('active-click');
        }

        date++;
      }
    }
    board.appendChild(row);
  }
}

Cal.prototype.getDaysInPrevMonth = function(y,m) {
  let cell = document.querySelectorAll('.cell.jump-to-prevMonth'),
      getDates = new Date(y, m, 0).getDate(),
      x = (getDates+1) - cell.length;
  
  cell.forEach(el=> el.innerText = x++);
}

Cal.prototype.getDaysInNextMonth = function() {
  let cell = document.querySelectorAll('.cell.jump-to-nextMonth'),
      x = 1;
  
  cell.forEach(el=> {
      el.innerText = x < 10 ? '0' + x : x
      x++
  })
}

Cal.prototype.nextMonth = function() {
  this.currentYear = (this.currentMonth === 11) ? this.currentYear + 1 : this.currentYear;
  this.currentMonth = (this.currentMonth + 1) % 12;
  this.template(this.currentDate, this.currentMonth, this.currentYear);
  this.getDaysInNextMonth();
  this.getDaysInPrevMonth(this.currentYear, this.currentMonth);
  this.updateEventHeader();
  this.checkForValidEvent();
  this.event_add();
}

Cal.prototype.prevMonth = function() {
  this.currentYear = (this.currentMonth === 0) ? this.currentYear - 1 : this.currentYear;
  this.currentMonth = (this.currentMonth === 0) ? 11 : this.currentMonth - 1;
  this.template(this.currentDate, this.currentMonth, this.currentYear);
  this.getDaysInNextMonth();
  this.getDaysInPrevMonth(this.currentYear, this.currentMonth);
  this.updateEventHeader();
  this.checkForValidEvent();
  this.event_add();
}

Cal.prototype.dateClicked = function() {
  window.addEventListener('click', (evt)=> {
    let that = evt.target,
        inside = that.classList
  
    if (inside.contains('current-month') || inside.contains('jump-to-nextMonth') || inside.contains('jump-to-prevMonth')) {
      document.querySelector('.active-click').classList.remove('active-click');
      that.classList.add('active-click');
      this.event_add();
      this.updateEventHeader();
    }

    evt.preventDefault();
  });
}

Cal.prototype.updateEventHeader = function() {
  let itemSelect = document.querySelector('.active-click'),
      month = itemSelect.attributes['data-month'].value,
      year = itemSelect.attributes['data-year'].value,
      eventHeader = document.querySelector('.event-header'),
      today = new Date(year,month,parseInt(itemSelect.innerText)).toLocaleDateString('en-US', {weekday: 'long'});
  eventHeader.innerHTML  = `
    <h2>${today}</h2>
    <span>${itemSelect.innerText}, ${months[month]} ${year}</span>
  `
}

Cal.prototype.event_add = function() {
 let current_event = [],
     itemSelect = document.querySelector('.active-click'),
     date = itemSelect.innerHTML,
     month = shortMonths[itemSelect.attributes['data-month'].value],
     year = itemSelect.attributes['data-year'].value;

  for (let i = 0; i < this.data.eventList.length; i++) {
    if (date == this.data.eventList[i].date && month == this.data.eventList[i].month && year == this.data.eventList[i].year) {
      current_event.push(this.data.eventList[i]);
    }
  }

  this.returnEventPanelTemplate(current_event);

  if (current_event == '' || current_event == null) {
    document.querySelector('.event-panel').innerHTML = `
    <h1>No Event</h1>
    `
  }
  
}

Cal.prototype.returnEventPanelTemplate = function(item) {
  let template = '';
  template += item.map(el => {
    return `
      <div class="event-item">
        <div class="text">
          <h3>${el.text}</h3>
          <span onclick='c.starred(${el.id})' class='star'>
            <i class="${el.starred ? 'ion-ios-star' : 'ion-ios-star-outline'}"></i>
          <span>
          <span onclick='c.removeEvent(${el.id})' class='remove'>
            &times;
          </span>
        </div>
      </div>
    `
  }).join('');
  document.querySelector('.event-panel').innerHTML = template;
}


Cal.prototype.removeEvent = function(id) {
  for (let i = 0; i < this.data.eventList.length; i++) {
    if (this.data.eventList[i].id == id) {
      this.data.eventList.splice(i, 1);
    }
  }
  
  this.updateItem(this.data.eventList);
  this.event_add();
}

Cal.prototype.addNewEvent = function() {
  if (!document.querySelector('.active-click')) return;

  let overlay = document.querySelector('.calendar-overlay');
  let modal = document.querySelector('.modal');
  let event_input = document.getElementById('event-input');

  overlay.classList.add('fadeIn');
  modal.classList.add('slide-down');

  window.addEventListener('click', (event)=> {
    if (event.target.classList.contains('fadeIn') ||
        event.target.classList.contains('cancel-event-btn') ||
        event.target.classList.contains('ok-event-btn')) {
      overlay.classList.remove('fadeIn');
      modal.classList.remove('slide-down');

      setTimeout(() => {
        event_input.value = '';
      }, 400);

    }
  });
}

Cal.prototype.starred = function(id) {
  let el = this.data.eventList.find((x)=> x.id === id);

  if (!el) return;

  el.starred = !el.starred;

  this.event_add();
  this.updateItem(this.data.eventList);
}

Cal.prototype.OkEventBtn = function() {
  let activeClick = document.querySelector('.active-click'),
      event_input = document.getElementById('event-input'),
      date = activeClick.innerHTML,
      month = activeClick.attributes['data-month'].value,
      year = activeClick.attributes['data-year'].value;

  if (event_input.value == '') return;

  let event_data = {
    text: event_input.value,
    date: date,
    month: shortMonths[month],
    year: year,
    starred: false,
    id: c.data.newId
  };
  c.data.newId++;

  c.data.eventList.push(event_data);
  c.updateId(c.data.newId)
  c.updateItem(c.data.eventList);
  c.event_add();
  c.checkForValidEvent();
}

Cal.prototype.checkForValidEvent = function() {
  for (let i = 0; i < this.data.eventList.length; i++) {
    let cells = document.querySelectorAll('.cell');
    cells.forEach(cell=> {
      checkDate = cell.innerText == this.data.eventList[i].date;
      checkMonth = shortMonths[cell.attributes['data-month'].value] == this.data.eventList[i].month;
      checkyear = cell.attributes['data-year'].value;

      if (!(checkDate && checkMonth && checkyear)) {
        return
      }else {
        cell.classList.add('active-event');
      }
    })
  }
}

Cal.prototype.updateId = function(new_id) {
  localStorage.setItem(id_name, new_id)
}

Cal.prototype.updateItem = function(list) {
  localStorage.setItem(item_name, JSON.stringify(list))
}

const c = new Cal();




















































