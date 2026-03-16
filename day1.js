let expenses = [];
expenses.push({
    amt:100,
    item:"food"
})
expenses.push({
    amt:500,
    item:"photo"
})
expenses.push({
    amt:1000,
    item:"makeup"
})

console.log(expenses);

let total = expenses.reduce((sum,item) => {
    return sum+item.amt;
},0);
console.log(total); // reduce the array to one value 

let filter = expenses.filter(exp => exp.item === "makeup");
console.log(filter); //filter returns only in array

function addExpense(amt,item){
    expenses.push({
        amt:amt,
        item:item
    });
    }

    addExpense(200,"clothes");
    console.log(expenses);