const requests = [ 
 
{ 
    id:1, 
 
    name:"Rakib Hasan", 
 
    location:"Sylhet", 
 
    teachSkills:["HTML","CSS","JavaScript"], 
 
    learnSkills:["React"], 
 
    status:"Pending" 
}, 
 
{ 
    id:2, 
 
    name:"Sarah Ahmed", 
 
    location:"Dhaka", 
 
    teachSkills:["Python","Django"], 
 
    learnSkills:["Java"], 
 
    status:"Active" 
}, 
 
{ 
    id:3, 
 
    name:"John Smith", 
 
    location:"Chattogram", 
 
    teachSkills:["Photoshop"], 
 
    learnSkills:["Illustrator"], 
 
    status:"Completed", 
 
    rating:5, 
 
    review:"Excellent learning partner. Highly recommended." 
} 
 
]; 
 
 
// =========================== 
// Load 
// =========================== 
 
renderRequests("all"); 
 
 
// =========================== 
// Tabs 
// =========================== 
 
document.querySelectorAll(".tab-btn") 
 
.forEach(btn=>{ 
 
    btn.addEventListener("click",()=>{ 
 
        document 
        .querySelectorAll(".tab-btn") 
        .forEach(tab=>tab.classList.remove("active")); 
 
        btn.classList.add("active"); 
 
        renderRequests(btn.dataset.tab); 
 
    }); 
 
}); 
 
 
// =========================== 
// Render 
// =========================== 
 
function renderRequests(filter){ 
 
    const container = 
    document.getElementById("requestContainer"); 
 
    container.innerHTML=""; 
 
    let filtered=requests; 
 
    if(filter!=="all"){ 
 
        filtered=requests.filter(r=> 
 
            r.status.toLowerCase()===filter 
 
        ); 
 
    } 
 
    if(filtered.length===0){ 
 
        container.innerHTML=` 
 
        <div class="empty"> 
 
            <h2> 
 
                No Requests Found 
 
            </h2> 
 
        </div> 
 
        `; 
 
        return; 
 
    } 
 
    filtered.forEach(request=>{ 
 
        let buttons=""; 
 
        let statusClass=""; 
 
        let review=""; 
 
        if(request.status==="Pending"){ 
 
            statusClass="pending"; 
 
            buttons=` 
 
            <button class="accept-btn"> 
 
                Accept 
 
            </button> 
 
            <button class="reject-btn"> 
 
                Reject 
 
            </button> 
 
            `; 
 
        } 
 
        else if(request.status==="Active"){ 
 
            statusClass="active-status"; 
 
            buttons=` 
 
            <button class="chat-btn"> 
 
                Open Chat 
 
            </button> 
 
            <button class="complete-btn"> 
 
                Complete Swap 
 
            </button> 
 
            `; 
 
        } 
 
        else{ 
 
            statusClass="completed"; 
 
            review=` 
 
            <div class="section"> 
 
                <div class="section-title"> 
 
                    Rating 
 
                </div> 
 
                
⭐⭐⭐⭐⭐
 
 
            </div> 
 
            <div class="section"> 
 
                <div class="section-title"> 
 
                    Review 
 
                </div> 
 
                <p> 
 
                    ${request.review} 
 
                </p> 
 
            </div> 
 
            `; 
 
            buttons=` 
 
            <button class="review-btn"> 
 
                View Review 
 
            </button> 
 
            `; 
 
        } 
 
        const avatar= 
        request.name.charAt(0).toUpperCase(); 
 
        const teach=request.teachSkills 
 
        .map(skill=> 
 
            `<span class="skill">${skill}</span>` 
 
        ).join(""); 
 
        const learn=request.learnSkills 
 
        .map(skill=> 
 
            `<span class="skill learn">${skill}</span>` 
 
        ).join(""); 
 
        container.innerHTML+=` 
 
<div class="request-card"> 
 
    <div class="request-header"> 
 
        <div class="avatar"> 
 
            ${avatar} 
 
        </div> 
 
        <div> 
 
            <h3> 
 
                ${request.name} 
 
            </h3> 
 
            <p> 
 
                <i class="fa-solid fa-location-dot"></i> 
 
                ${request.location} 
 
            </p> 
 
        </div> 
 
    </div> 
 
    <div class="section"> 
 
        <div class="section-title"> 
 
            Skills They Teach 
 
        </div> 
 
        <div class="skill-list"> 
 
            ${teach} 
 
        </div> 
 
    </div> 
 
    <div class="section"> 
 
        <div class="section-title"> 
 
            Wants To Learn 
 
        </div> 
 
        <div class="skill-list"> 
 
            ${learn} 
 
        </div> 
 
    </div> 
 
    ${review} 
 
    <div class="status ${statusClass}"> 
 
        ${request.status} 
 
    </div> 
 
    <div class="request-actions"> 
 
        ${buttons} 
 
    </div> 
 
</div> 
 
`; 
 
    }); 
 
} 
 
 
// =========================== 
// Logout 
// =========================== 
 
const logoutBtn=document.getElementById("logoutBtn"); 
 
if(logoutBtn){ 
logoutBtn.onclick=()=>{ 
localStorage.removeItem("token"); 
window.location.href="login.html"; 
}; 
} 