let mealsState=[]
const stringToHTML=(string)=>{
    const parser= new DOMParser()
    const doc= parser.parseFromString(string,"text/html")
    return doc.body.firstChild
}
const renderItem= (item)=> {
    const element=stringToHTML(`<li data-id=${item._id}>${item.name}</li>`)
    element.addEventListener('click',() => {
        const mealsList=document.getElementById('meals-list')
        let isSelected=element.classList.item(0)==='selected'
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        if(isSelected){
            element.classList.remove('selected')
            submit.setAttribute('disabled',false);
        }
        else{
            element.classList.add('selected')
            submit.removeAttribute('disabled')
            const mealIdInput= document.getElementById('meal-id')
            mealIdInput.value=item._id
        }
    })
    return element
}
const renderOrder=(order,meals)=>{
    const meal=meals.find(meal=>meal._id===order.meal_id)
    const element=stringToHTML(`<li data-id=${order._id}>${meal.name}-${order.user_id}</li>`)
    return element
}
window.onload= () =>{
    const orderForm= document.getElementById('order')
    orderForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const submit= document.getElementById('submit')
        submit.setAttribute('disabled',true)
        const mealId= document.getElementById('meal-id')
        const mealIdValue=mealId.value
        const order={
            meal_id:mealIdValue,
            user_id:"Manuel"
        }
        fetch("https://almuezi.vercel.app/api/orders",{
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json'
            },
            body: JSON.stringify(order),
        }).then(x=>x.json())
        .then(response=>{
            const renderedOrder=renderOrder(response,mealsState)
            const ordersList= document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }

    fetch("https://almuezi.vercel.app/api/meals")
    .then(response => response.json())
    .then(data => {
        mealsState=data
        const mealsList= document.getElementById('meals-list')
        const submit= document.getElementById('submit')
        mealsList.removeChild(mealsList.firstElementChild)
        const listItemsHTML= data.map(renderItem)
        listItemsHTML.forEach(element => mealsList.appendChild(element))
        fetch("https://almuezi.vercel.app/api/orders")
        .then(response=> response.json())
        .then(dataOrder=>{
            const ordersList= document.getElementById('orders-list')
            ordersList.removeChild(ordersList.firstElementChild)
            const listOrdersHTML=dataOrder.map(order=>renderOrder(order,data))
            listOrdersHTML.forEach(element=>ordersList.appendChild(element))
        })
    })

} 