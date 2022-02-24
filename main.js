const stringToHTML=(string)=>{
    const parser= new DOMParser()
    const doc= parser.parseFromString(string,"text/html")
    return doc.body.firstChild
}
const renderItem= (item)=> {
    const element=stringToHTML(`<li data-id=${item._id}>${item.name}</li>`)
    element.addEventListener('click',() => {
        const mealsList=document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
    })
    return element
}
window.onload= () =>{
    fetch("https://almuezi.vercel.app/api/meals")
    .then(response => response.json())
    .then(data => {
        const mealsList= document.getElementById('meals-list')
        const submit= document.getElementById('submit')
        mealsList.removeChild(mealsList.firstElementChild)
        const listItemsHTML= data.map(renderItem)
        listItemsHTML.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')
    })

} 