const WAITLIST_URL = "https://forms.gle/WAUrEAFMLEEAnkxa8";

const DEMO = {
  video:{
    src:"assets/video/demo.mp4",
    title:"Shot Analysis",
    stamp:"Shot Analysis",
    meta:"18/1/2026 • 7:23 PM"
  },

  metrics:[
    {name:"Release Angle",score:"EXCELLENT",value:"57°"},
    {name:"Elbow Angle",score:"EXCELLENT",value:"175°"},
    {name:"Knee Angle",score:"EXCELLENT",value:"170°"},
    {name:"Entry Angle",score:"GOOD",value:"61°"},
    {name:"Release Height",score:"GOOD",value:"2.21 m"}
  ],

  charts:{
    chart1Img:"assets/img/elbow.png",
    chart2Img:"assets/img/knee.png",
    releaseImg:"assets/img/release.png"
  },

  feedback:`1. Shot Mechanics

The elbow reaches full extension at release (175°), showing clean follow-through. The legs are fully extended at 170°, meaning the ball is released at the peak of power generation. Release height remains solid at 2.21 m.

2. Ball Trajectory

The 57° release angle creates a very steep 61° entry angle. This produces a soft drop but limits side-to-side margin for error.

3. Outcome

The shot was made, driven by clean mechanics, good timing, and touch.

4. Overall Assessment

Mechanically sound shot with good sequencing, but the arc is higher than ideal for consistent range.

Key Cue: Keep the timing and flatten the arc slightly.`,

  note:"Pre-launch prototype. Values and visuals are generated from the current Basketball Lab pipeline."
};

function el(id){
  return document.getElementById(id);
}

function setupWaitlistLinks(){
  const links = document.querySelectorAll(".waitlistLink");

  links.forEach(link=>{
    link.href = WAITLIST_URL;
  });
}

function render(){
  setupWaitlistLinks();

  el("demoVideo").src = DEMO.video.src;
  el("videoTitle").textContent = DEMO.video.title;
  el("shotStamp").textContent = DEMO.video.stamp;
  el("shotMeta").textContent = DEMO.video.meta;

  el("chart1Img").src = DEMO.charts.chart1Img;
  el("chart2Img").src = DEMO.charts.chart2Img;
  el("releaseImg").src = DEMO.charts.releaseImg;

  const grid = el("metricGrid");
  grid.innerHTML = "";

  DEMO.metrics.forEach(m=>{
    const d = document.createElement("div");
    d.className = "metric";
    d.innerHTML = `
      <div class="metricTop">
        <div class="metricName">${m.name}</div>
        <div class="metricScore">${m.score}</div>
      </div>
      <div class="metricValue">${m.value}</div>
    `;
    grid.appendChild(d);
  });

  const full = DEMO.feedback;
  const preview = full.split("\n").slice(0,6).join("\n");

  el("feedbackPreview").textContent = preview;
  el("feedbackFull").textContent = full;

  el("toggleFeedback").onclick = () => {
    el("feedbackPreview").classList.toggle("hidden");
    el("feedbackFull").classList.toggle("hidden");
    el("toggleFeedback").textContent =
      el("feedbackFull").classList.contains("hidden") ? "Show more" : "Show less";
  };

  el("noteText").textContent = DEMO.note;
}

render();
