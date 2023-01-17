let mealsState=[]
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
    const element=stringToHTML(`<li data-id=${order._id}>${meal.name}\n[${order.user_id}]</li>`)
    return element
}
const controlCloseSesion=()=>{
    const botonClose= document.getElementById('form-boton-closesesion')
    botonClose.onsubmit=(evento)=>{
        evento.preventDefault()
        localStorage.clear()
        user={}
        renderRegister()
    }
}
const controlSubmit=()=>{
    const orderForm= document.getElementById('order')
    orderForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const submit= document.getElementById('submit')
        submit.setAttribute('disabled',true)
        const mealId= document.getElementById('meal-id')
        const mealIdValue=mealId.value
        const order={
            meal_id:mealIdValue,
            user_id:user._id
        }
        fetch("https://almuerziapi-production.up.railway.app/api/orders",{
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json',
                    authorization:localStorage.getItem('token')
            },
            body: JSON.stringify(order)
        })
        .then(x=>x.json())
        .then(response=>{
            const renderedOrder=renderOrder(response,mealsState)
            const ordersList= document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }
}
const controlDatos=()=>{
    fetch("https://almuerziapi-production.up.railway.app/api/meals")
    .then(response => response.json())
    .then(data => {
        mealsState=data
        const mealsList= document.getElementById('meals-list')
        const submit= document.getElementById('submit')
        mealsList.removeChild(mealsList.firstElementChild)
        const listItemsHTML= data.map(renderItem)
        listItemsHTML.forEach(element => mealsList.appendChild(element))
        fetch("https://almuerziapi-production.up.railway.app/api/orders")
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
    controlCloseSesion()
    controlDatos()
    controlSubmit()
}
const renderApp=()=>{
    const token=localStorage.getItem('token')
    if(token){
        user=JSON.parse(localStorage.getItem('user'))
       return renderOrders()
    }
    renderRegister()
}
const renderRegister=()=>{
    const registerView= document.getElementById('login-view')
    document.getElementById('app').innerHTML=registerView.innerHTML
    const textTitle=document.getElementById("title-log-reg")
    textTitle.textContent='Registrate'

    const nameBotonInitSes=document.getElementById("boton-initsesion")
    nameBotonInitSes.textContent='Iniciar sesión'

    const botonInitSes= document.getElementById('form-boton-initsesion')
    botonInitSes.onsubmit=(evento)=>{
        evento.preventDefault()
        renderLogin()
    }

    const registerForm= document.getElementById('login-form')
    registerForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const email=document.getElementById('email').value
        const password= document.getElementById('password').value

        if(validationRegister()){
            fetch("https://almuerziapi-production.up.railway.app/api/auth/register",{
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({email,password})
                }).then(x=> x.json())
                .then(response=>{  
                    if(response.resp==='Usuario ya existe'){
                        alert('Este usuario ya existe,Inicia sesión')
                    }
                    else if(response.resp==='Usuario creado con exito'){
                        const aviso= document.getElementById('aviso')
                        aviso.innerHTML="¡Usuario registrado con exito!"
                        const email= document.getElementById('email')
                        const password= document.getElementById('password')
                        email.value=""
                        password.value=""
                    }    
                })
        }
        else{    

        }
    }    
}
const validationRegister=()=>{
    const email= document.getElementById('email')
    const password= document.getElementById('password')
    const aviso= document.getElementById('aviso')

    aviso.innerHTML=""
    let warnings=""
    let assert= true
    let regexPassword=/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/
    let regexEmail=/^([\da-z_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
    if(!regexEmail.test (email.value)){
        warnings +=`El email no es valido <br>`
        assert= false
    }    
    if(!regexPassword.test(password.value)){
        warnings +=`La contraseña no es valida <br>`
        alert(`La contraseña debe tener al entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.NO puede tener otros símbolos.`)
        assert= false
    }
    if(!assert){
        aviso.innerHTML=warnings
    }
    return assert

}
const renderLogin=()=>{
    const loginView= document.getElementById('login-view')
    document.getElementById('app').innerHTML=loginView.innerHTML
    const textTitle=document.getElementById("title-log-reg")
    textTitle.textContent='Inicia sesión'

    const nameBotonInitSes=document.getElementById("boton-initsesion")
    nameBotonInitSes.textContent='Registrate'

    const botonInitSes= document.getElementById('form-boton-initsesion')
    botonInitSes.onsubmit=(evento)=>{
        evento.preventDefault()
        renderRegister()
    }
    
    const loginForm= document.getElementById('login-form')
    loginForm.onsubmit=(evento)=>{
        evento.preventDefault()
        const email=document.getElementById('email').value
        const password= document.getElementById('password').value
        
        fetch("https://almuerziapi-production.up.railway.app/api/auth/login",{
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({email,password})
        }).then(x=> x.json())
        .then(response=>{
            if(response.token===undefined){
                throw new Error("token no encontrado")
            }
            localStorage.setItem('token',response.token)
            return response.token
        })
        .then(token=>{
            return fetch("https://almuerziapi-production.up.railway.app/api/auth/me",{
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
        .catch(error=>{
            const aviso= document.getElementById('aviso')
            aviso.innerHTML="Email y/o contaseña incorrecta!!!"
        })
    }
}
window.onload= () =>{
    renderApp()    
} 
