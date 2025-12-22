//public/expense_script.js
let allExpenses=[];
let currentPage=1;
//const items_per_page=10;
let items_per_page=parseInt(localStorage.getItem("itemsPerPage"))||10;

function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
}

function addExpense(e) {
    e.preventDefault();
    
    const expense={
        amount:parseInt(e.target.amount.value),
        description:e.target.description.value,
        category:e.target.category.value,
        userId:localStorage.getItem("userId")
    }
    
    axios.post('http://localhost:3000/expense', expense)
        .then(res=> {
            allExpenses.unshift(res.data);
            currentPage=1;
            renderExpenses();
            e.target.reset();
        })
        .catch(err=> {
            alert("Error adding expense: "+err.message);
        })
}

function addIncome(e) {
    e.preventDefault();

    const income={
        amount:parseInt(e.target.amount.value),
        description:e.target.description.value,
        category:e.target.category.value,
        userId:localStorage.getItem("userId"),
        type:"income"
    }

    axios.post("http://localhost:3000/expense",income)
        .then(res => {
            allExpenses.unshift(res.data);
            currentPage=1;
            renderExpenses();
            e.target.reset();
        })
        .catch(err => alert("Error adding income"+err.message));
}
/*
function showExpenseOnScreen(expense) {
    const parent=document.getElementById('expenseList');
    const li=document.createElement('li');
    li.textContent=`${expense.amount} - ${expense.description} - ${expense.category}`;
    
    const deleteBtn=document.createElement('button');
    deleteBtn.textContent='Delete';
    deleteBtn.onclick=()=> {
        axios.delete(`http://localhost:3000/expense/${expense.id}`).then(()=> {
            li.remove();
        }).catch(err=> {
            console.log("Error deleting expense:",err);
            alert("Error deleting expense");
        })
    }
    
    li.appendChild(deleteBtn);
    parent.appendChild(li);
}

function showIncomeOnScreen(income) {
    const parent=document.getElementById("expenseList");
    const li=document.createElement("li");
    li.innerHTML=`Income: Rs.${income.amount} - ${income.description} - ${income.category}`;
    parent.appendChild(li);
}

*/

const cashfree = Cashfree({
    mode: "sandbox"
});

function getTotalPages() {
    return Math.ceil(allExpenses.length/items_per_page);
}

function renderExpenses() {
    const tbody=document.getElementById("expenseBody");
    tbody.innerHTML="";

    const start=(currentPage-1)*items_per_page;
    const end=start+items_per_page;
    const pageItems=allExpenses.slice(start,end);

    pageItems.forEach(exp => {
        const tr=document.createElement("tr");

        tr.innerHTML=`
            <td>${formatDate(exp.createdAt||exp.date)}</td>
            <td>${exp.description}</td>
            <td>${exp.category}</td>
            <td>${exp.type==="income"?"Income":"Expense"}</td>
            <td>${exp.amount}</td>
            <td>
                <button onclick="deleteExpense(${exp.id})">Delete</button>
            </td>
        `;

        tbody.appendChild(tr);
    })
    //updatePaginationInfo();
    renderPageNumbers();
}

function deleteExpense(id) {
    axios.delete(`http://localhost:3000/expense/${id}`)
        .then(() => {
            allExpenses=allExpenses.filter(e => e.id!==id);

            if (currentPage>getTotalPages()) {
                currentPage=getTotalPages() || 1;
            }
            renderExpenses();
        })
        .catch(() => alert("Delete failed"))
}

/*
function updatePaginationInfo() {
    const totalPages=Math.ceil(allExpenses.length/items_per_page);
    document.getElementById("prevBtn").disabled=currentPage===1;
    document.getElementById("nextBtn").disabled=currentPage===totalPages;
}

document.getElementById("prevBtn").onclick=() => {
    if (currentPage>1) {
        currentPage--;
        renderExpenses();
    }
}

document.getElementById("nextBtn").onclick=() => {
    if (currentPage<getTotalPages()) {
        currentPage++;
        renderExpenses();
    }
}
*/

function renderPageNumbers() {
    const pageContainer=document.getElementById("pageNumbers");
    pageContainer.innerHTML="";

    const totalPages=getTotalPages();
    if (totalPages<=1) return;

    const maxVisible=3;
    let start=Math.max(1,currentPage-1);
    let end=Math.min(totalPages,start+maxVisible-1);

    if (end-start<maxVisible-1) {
        start=Math.max(1,end-maxVisible+1);
    }

    for (let i=start;i<=end;i++) {
        const btn=document.createElement("button");
        btn.textContent=i;

        if (i===currentPage) {
            btn.disabled=true;
        }

        btn.onclick=() => {
            currentPage=i;
            renderExpenses();
        }

        pageContainer.appendChild(btn);
    }
}

const itemsPerPageSelect=document.getElementById("itemsPerPageSelect");

if (itemsPerPageSelect) {
    itemsPerPageSelect.value=items_per_page;

    itemsPerPageSelect.addEventListener("change", () => {
        items_per_page=parseInt(itemsPerPageSelect.value);
        localStorage.setItem("itemsPerPage",items_per_page);

        currentPage=1;
        renderExpenses();
    })
}

async function checkPremiumStatus() {
    const userId=localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res=await axios.get(`http://localhost:3000/user/${userId}`);
        const user=res.data;

        if (user.isPremiumUser) {
            showPremiumFeatures();
        } else {
            showNonPremiumFeatures();
        }
    } catch (error) {
        console.error("Error checking premium status:",error.message);
    }
}

function download() {
    const userId=localStorage.getItem("userId");
    axios.get(`http://localhost:3000/expense/download?userId=${userId}`)
        .then((response) => {
            if (response.status===200) {
                const a=document.createElement("a");
                a.href=response.data.fileURL;
                a.download='myexpense.csv';
                a.click();
            }
        })
        .catch((err) => {
            alert("Download failed or you are not a premium user",err);
        })
}

async function loadReport(period) {
    try {
        const userId=localStorage.getItem("userId");
        const res=await axios.get(`http://localhost:3000/expense/report?userId=${userId}&period=${period}`);
        const reportSection=document.getElementById("reportSection");
        reportSection.innerHTML=`<h4>${period.toUpperCase()} REPORT</h4>`;

        if (res.data.length===0) {
            reportSection.innerHTML+="<p>No records found</p>";
            return;
        }

        const table=document.createElement("table");
        table.border="1";
        table.style.borderCollapse="collapse";
        table.style.width="100%";

        table.innerHTML=`
            <thead>
                <tr style="background:#009688;color:white;">
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Income</th>
                    <th>Expense</th>
                </tr>
            </thead>
            <tbody></tbody>    
        `;

        const tbody=table.querySelector("tbody");

        let totalIncome=0;
        let totalExpense=0;

        res.data.forEach(item => {
            const tr=document.createElement("tr");
            
            tr.innerHTML=`
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td style="color:green;">
                    ${item.type==="income"?item.amount:"0"}
                </td>
                <td style="color:red;">
                    ${item.type==="expense"?item.amount:"0"}
                </td>    
            `;

            if (item.type==="income") totalIncome+=item.amount;
            if (item.type==="expense") totalExpense+=item.amount;

            tbody.appendChild(tr);
        })

        const totalRow=document.createElement("tr");
        totalRow.style.fontWeight="bold";
        totalRow.innerHTML=`
            <td colspan="3">TOTAL</td>
            <td style="color:green;">Rs. ${totalIncome}</td>
            <td style="color:red;">Rs. ${totalExpense}</td>
        `;

        tbody.appendChild(totalRow);

        reportSection.appendChild(table);

    } catch (error) {
        console.error("Error loading report:",error.message);
        alert("Failed to load report");
    }
}

async function downloadReport() {
    try {
        const userId=localStorage.getItem("userId");
        const period="monthly";

        window.location.href=`http://localhost:3000/expense/report/download?userId=${userId}&period=${period}`;
    } catch (error) {
        alert("Failed to download report");
    }
}

function loadDailyReport() {loadReport("daily");}

function loadWeeklyReport() {loadReport("weekly");}

function loadMonthlyReport() {loadReport("monthly");}

function loadYearlyReport() {loadReport("yearly");}

function showPremiumFeatures() {
    document.getElementById("premiumHeader").style.display="block";
    document.getElementById("buyPremiumBtn").style.display="none";
    document.getElementById("premiumReports").style.display="block";
}

function showNonPremiumFeatures() {
    document.getElementById("premiumHeader").style.display="none";
    document.getElementById("buyPremiumBtn").style.display="block";
    document.getElementById("premiumReports").style.display="none";
}

document.getElementById("buyPremiumBtn").addEventListener("click", async () => {
    try {
        const userId=localStorage.getItem("userId");
        const response=await axios.post('http://localhost:3000/process-payment',{userId});

        const {paymentSessionId}=response.data;

        let checkoutOptions = {
            paymentSessionId,
            redirectTarget: "_self",
        };
                
        cashfree.checkout(checkoutOptions);
    } catch (error) {
        console.error("Error creating payment session:",error);
    }
});

document.getElementById("showLeaderboardBtn").addEventListener("click",async ()=> {
    try {
        const response=await axios.get("http://localhost:3000/premium/showleaderboard");
        const leaderboardData=response.data;

        const leaderboardSection=document.getElementById("leaderboardSection");
        leaderboardSection.innerHTML="<h3>Leaderboard</h3>";

        const list=document.createElement("ul");
        leaderboardData.forEach((user)=> {
            const li=document.createElement("li");
            li.textContent=`Name: ${user.name} - Total Expense: ${user.totalExpense}`;
            list.appendChild(li);
        })

        leaderboardSection.appendChild(list);
    } catch (error) {
        console.error("Error fetching leaderboard:",error.message);
    }
})

window.addEventListener('DOMContentLoaded', async ()=> {
    const userId=localStorage.getItem("userId");
    if (!userId) return;

    await checkPremiumStatus();

    try {
        const res=await axios.get(`http://localhost:3000/expense?userId=${userId}&page=1&limit=1000`);
        allExpenses=res.data.expenses;
        currentPage=1;
        renderExpenses();
    } catch (error) {
        console.error("Error loading expenses:",error);
    }
})

