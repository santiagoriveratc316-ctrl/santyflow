<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SantyFlow</title>
<style>
body{margin:0;font-family:system-ui;background:#000;color:#fff;padding:16px}
.card{background:#111;border-radius:18px;padding:16px;margin-bottom:16px;box-shadow:0 0 0 1px #222}
h1{color:#a855f7}
.progress{height:10px;background:#222;border-radius:10px;overflow:hidden;margin:6px 0}
.bar{height:100%;background:#a855f7}
.row{display:flex;align-items:center;gap:8px;margin:6px 0}
input,textarea,button{border-radius:10px;border:none;padding:8px;font-size:14px}
button{background:#a855f7;color:#fff}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.day{height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#222;font-size:12px}
.done{background:#a855f7}
</style>
</head>
<body>
<h1>SantyFlow</h1>

<div class="card">
<h3>Dashboard</h3>
<div class="progress"><div id="habitBar" class="bar"></div></div>
<p id="habitText"></p>
<p id="points"></p>
<p id="streak"></p>
<p id="level"></p>
<p id="motivation"></p>
</div>

<div class="card">
<h3>Hábitos</h3>
<div id="habits"></div>
</div>

<div class="card">
<h3>Proyecto 3D / GameDev</h3>
<div class="progress"><div id="taskBar" class="bar"></div></div>
<div id="tasks"></div>
</div>

<div class="card">
<h3>Dinero</h3>
<div class="progress"><div id="moneyBar" class="bar"></div></div>
<p id="moneyText"></p>
<input id="moneyInput" placeholder="Cantidad">
<button onclick="addMoney('add')">Ingreso</button>
<button onclick="addMoney('sub')">Gasto</button>
</div>

<div class="card">
<h3>Diario</h3>
<textarea id="diary" rows="4" style="width:100%"></textarea>
</div>

<div class="card">
<h3>Calendario</h3>
<div id="calendar" class="grid"></div>
</div>

<script>
const HABITS=["Beber agua","Desayunar","Plan rápido del día","Estudio extra","Blender / Unity","Actividad física","Lectura","Diario","Dormir temprano"]
const TASKS=["Practicar Blender","Practicar Unity","Avanzar proyecto","Ver tutorial","Exportar modelo"]
const GOAL=10000000

// ===== FECHA COLOMBIA =====
function getTodayISO(){
 const n=new Date()
 return new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,10)
}

let today=getTodayISO()
let now=new Date()

let db=JSON.parse(localStorage.getItem('santy_html')||"{}")
if(!db.days)db.days={}
if(!db.days[today])db.days[today]={habits:{},tasks:{},diary:"",completed:false}
if(!db.moneyTotal)db.moneyTotal=0
if(!db.week)db.week={}

function save(){localStorage.setItem('santy_html',JSON.stringify(db))}

// ===== CAMBIO AUTOMATICO DE DIA =====
setInterval(()=>{
 const newToday=getTodayISO()
 if(newToday!==today){
   today=newToday
   if(!db.days[today])db.days[today]={habits:{},tasks:{},diary:"",completed:false}
   save()
   renderAll()
 }
},60000)

// ===== RENDER PRINCIPAL =====
function renderAll(){
 renderHabits()
 renderTasks()
 renderDashboard()
 renderCalendar()
 renderChart()
}

function renderDashboard(){
const d=db.days[today]

// HABITOS
const hc=Object.values(d.habits).filter(Boolean).length
const hp=hc/HABITS.length*100
habitBar.style.width=hp+'%'
habitText.innerText=Math.round(hp)+'% hábitos'

// TAREAS
const tc=Object.values(d.tasks).filter(Boolean).length
const tp=tc/TASKS.length*100
taskBar.style.width=tp+'%'

// PUNTOS
const pts=hc*10+tc*20
points.innerText=pts+' puntos'
level.innerText='⭐ Nivel '+(Math.floor(pts/500)+1)

// MOTIVACION
if(hp>70)motivation.innerText='🔥 Increíble disciplina'
else if(hp>40)motivation.innerText='⚡ Buen progreso'
else motivation.innerText='💪 Empieza pequeño'

// DINERO
const percent=Math.min((db.moneyTotal/GOAL)*100,100)
moneyBar.style.width=percent+'%'
moneyText.innerText='Ahorro de 10 millones → $'+db.moneyTotal.toLocaleString('es-CO')

// DIARIO
diary.value=d.diary||""

// GUARDAR SEMANA
const weekKey=new Date().getDay()
db.week[weekKey]=hp

// COMPLETADO DIA
if(hc>0||tc>0)d.completed=true

// RACHA
streak.innerText='🔥 Racha: '+calcStreak()+' días'

save()
}

// ===== RACHA =====
function calcStreak(){
let count=0
let date=new Date()
while(true){
 const iso=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10)
 if(db.days[iso]?.completed)count++
 else break
 date.setDate(date.getDate()-1)
}
return count
}

// ===== HABITOS =====
function renderHabits(){
habits.innerHTML=''
const d=db.days[today]
HABITS.forEach(h=>{
const row=document.createElement('div');row.className='row'
const c=document.createElement('input');c.type='checkbox';c.checked=d.habits[h]
c.onchange=()=>{d.habits[h]=c.checked;save();renderDashboard();renderCalendar()}
row.appendChild(c);row.append(h);habits.appendChild(row)
})}

// ===== TAREAS =====
function renderTasks(){
tasks.innerHTML=''
const d=db.days[today]
TASKS.forEach(t=>{
const row=document.createElement('div');row.className='row'
const c=document.createElement('input');c.type='checkbox';c.checked=d.tasks[t]
c.onchange=()=>{d.tasks[t]=c.checked;save();renderDashboard();renderCalendar()}
row.appendChild(c);row.append(t);tasks.appendChild(row)
})}

// ===== DINERO =====
function addMoney(type){
let raw=moneyInput.value.replace(/\./g,'').replace(/,/g,'')
const v=Number(raw)
if(!v||v<1000){alert('Mínimo 1.000');return}
if(type==='add')db.moneyTotal+=v
else db.moneyTotal=Math.max(0,db.moneyTotal-v)
moneyInput.value=''
save();renderDashboard()
}

function resetMoney(){
if(confirm('Reiniciar ahorro?')){db.moneyTotal=0;save();renderDashboard()}
}

// BOTON RESET
const resetBtn=document.createElement('button')
resetBtn.innerText='Reiniciar ahorro'
resetBtn.onclick=resetMoney
moneyText.after(resetBtn)

// ===== DIARIO =====
diary.oninput=e=>{db.days[today].diary=e.target.value;save()}

// ===== CALENDARIO =====
function renderCalendar(){
calendar.innerHTML=''
const year=now.getFullYear()
const month=now.getMonth()
const days=new Date(year,month+1,0).getDate()
for(let i=1;i<=days;i++){
const date=new Date(year,month,i)
const iso=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10)
const d=document.createElement('div');d.className='day'
if(db.days[iso]?.completed)d.classList.add('done')
d.innerText=i
d.onclick=()=>loadDay(iso)
calendar.appendChild(d)
}
}

// ===== VER DIA PASADO =====
function loadDay(iso){
if(!db.days[iso])return
const d=db.days[iso]
alert('Hábitos: '+Object.values(d.habits).filter(Boolean).length+'
Tareas: '+Object.values(d.tasks).filter(Boolean).length+'
Diario: '+(d.diary||'vacío'))
}

// ===== GRAFICA =====
function renderChart(){
let canvas=document.getElementById('chart')
if(!canvas){
canvas=document.createElement('canvas')
canvas.id='chart'
canvas.height=120
canvas.style.width='100%'
document.body.appendChild(canvas)
}
const ctx=canvas.getContext('2d')
ctx.clearRect(0,0,canvas.width,canvas.height)
const values=[0,1,2,3,4,5,6].map(i=>db.week[i]||0)
const w=canvas.width/7
values.forEach((v,i)=>{ctx.fillRect(i*w,120-v,w-4,v)})
}

renderAll()
</script>
</body>
</html>
