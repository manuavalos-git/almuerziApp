let mealsState=[]
let ruta='login'// register,orders,login
let user={}

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
const controlSubmit=()=>{
    const orderForm= document.getElementById('order')
    orderForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const submit= document.getElementById('submit')
        submit.setAttribute('disabled',true)
        const mealId= document.getElementById('meal-id')
        const mealIdValue=mealId.value
        // const email=user.email.value
        const order={
            meal_id:mealIdValue,
            user_id:"picnaclk"
        }
        fetch("https://almuezi.vercel.app/api/orders",{
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json',
                    authorization:localStorage.getItem('token')
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
}
const controlDatos=()=>{
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
const renderOrders=()=>{
    const orderView= document.getElementById('orders-view')
    document.getElementById('app').innerHTML=orderView.innerHTML

    controlDatos()
    controlSubmit()
}
const renderApp=()=>{
    const token=localStorage.getItem('token')
    if(token){
        user=JSON.parse(localStorage.getItem('user'))
       return renderOrders()
    }
    renderLogin()
}
const renderLogin=()=>{
    const loginView= document.getElementById('login-view')
    document.getElementById('app').innerHTML=loginView.innerHTML

    const loginForm= document.getElementById('login-form')
    loginForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const email=document.getElementById('email').value
        const password= document.getElementById('password').value
        
        fetch("https://almuezi.vercel.app/api/auth/login",{
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({email,password})
        }).then(x=> x.json())
        .then(response=>{
            localStorage.setItem('token',response.token)
            ruta='orders'
            return response.token
        })
        .then(token=>{
            return fetch("https://almuezi.vercel.app/api/auth/me",{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    authorization:token
                }
            })
        })
        .then(x=>x.json())
        .then(fetchedUser=>{
            localStorage.setItem('user',JSON.stringify(fetchedUser))
            user=fetchedUser
            renderOrders()
        })
    }
}
window.onload= () =>{
    renderApp()    
} 