const API_KEY = '8b4628df';
const URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const temp = document.querySelector('.js-temp').content;
const notFoundTemp = document.querySelector('.js-not-found-temp').content;
const pageItemTemp = document.querySelector('.js-page-item-temp').content;
const loaderTemp = document.querySelector('.js-loader-temp').content;
const fragment = new DocumentFragment();
const list = document.querySelector('.js-list');
const elForm = document.querySelector('.js-form');
const elInput = document.querySelector('.js-input');
const pagination = document.querySelector('.js-pagination');
const elPrev = document.querySelector('.js-prev');
addDisabled(elPrev);
const elNext = document.querySelector('.js-next');
let page = 1;
localStorage.setItem('total', 0);
elInput.addEventListener('change', (evt) => {
    render([], list, false, true);
    evt.preventDefault();
    page = 1;
    getData(URL, `&s=${elInput.value.trim()}`);
});

elPrev.addEventListener('click', (evt) => {
    const total = localStorage.getItem('total');
    const calc = Math.ceil(Number(total) / 10);
    if(page == 1) {
        addDisabled(elPrev);
        return;
    }
    
    if(page > 1) {
        page--;
        getData(URL, `&s=${elInput.value.trim()}&page=${page}`);
        if(page == 1) addDisabled(elPrev);
        if(page < calc) addDisabled(elNext, false); 
        else addDisabled(elPrev, false)
        return;
    }
    
});

elNext.addEventListener('click', (evt) => {
    const total = localStorage.getItem('total');
    const calc = Math.ceil(Number(total) / 10);
    if(page < calc) {
        page++;
        if(page > 1) addDisabled(elPrev, false);
        getData(URL, `&s=${elInput.value.trim()}&page=${page}`);
        if(page == calc) addDisabled(elNext);
        else addDisabled(elNext, false);
        return;
    
    }
    addDisabled(elNext);
    
    
});

pagination.addEventListener('click', evt => {
    const total = localStorage.getItem('total');
    const calc = Math.ceil(Number(total) / 10);
    if(evt.target.matches('.js-page-link')) {
         page = evt.target.dataset.id;
         getData(URL, `&s=${elInput.value.trim()}&page=${page}`);
    }

    if(page == calc) addDisabled(elNext);
    else addDisabled(elNext, false);

    if(page == 1) addDisabled(elPrev)
    else addDisabled(elPrev, false);
});

mode();




function getData(url, value) {
    fetch(url + value)
    .then(res => res.json())
    .then(data => {
        if(data.Response === 'True') {
            render(data?.Search, list);
            if(Number(data.totalResults) > 10) {
                localStorage.setItem('total', Number(data.totalResults));
            }
        }else { 
            render(data, list, true)
            addPagination(false);
        }
        
       
    })
    .catch(err => console.log(err));   
}


function render(arr, node, error = false, loader = false) {
    node.innerHTML = '';
    if(error) {
        const template = notFoundTemp.cloneNode(true);
        template.querySelector('.js-error-text').textContent = arr?.Error || "Search not found !";
        node.appendChild(template);
        return;
    }

    if(loader) {
        const template = loaderTemp.cloneNode(true);
        node.appendChild(template);
        addPagination(false);
        return;
    }



    arr.forEach(item => {
        const template = temp.cloneNode(true);
        template.querySelector('.js-img').src = item?.Poster != 'N/A' ? item?.Poster  : './image/not-found.png';
        template.querySelector('.js-title').textContent = item?.Title;
        template.querySelector('.js-type').textContent = `Type: ${item?.Type}`;
        template.querySelector('.js-year').textContent = `Year: ${item?.Year}`;
        template.querySelector('.js-id').textContent = `IMDB ID: ${item?.imdbID}`;
        template.querySelector('.js-link').href = `https://www.imdb.com/title/${item?.imdbID}/?ref_=hm_top_tt_i_1`
        fragment.appendChild(template);
    });

    node.appendChild(fragment);
    addPagination();
}

function addPagination(add = true) {
    const total = Number(localStorage.getItem('total'));
    const calc = Math.ceil(total / 10);
    if(!add) {
        pagination.classList.remove('d-flex');
        pagination.classList.add('d-none');
        return;
    }

    pagination.classList.remove('d-none');
    pagination.classList.add('d-flex');

    const liItems = pagination.querySelectorAll('.js-page-item');
    liItems.forEach(item => item.remove());
    let counter = 0;
    let switched = false;
    let setUp = page;
    for(let i = 1; i <= calc; i++) {
        const temp = pageItemTemp.cloneNode(true);
        if(calc > 15) {
            if(i == 1 || counter < 6) {
                if(page > 2 && page != calc) {
                    if(!switched) {
                    
                        addPage(temp, 1);
                        fragment.appendChild(temp);
                        const newTemp = pageItemTemp.cloneNode(true);
                        addPage(newTemp, '...', true);
                        fragment.appendChild(newTemp);
                        switched = true;
                        continue;
                    }

                    addPage(temp, setUp);
                    fragment.appendChild(temp);
                    setUp++;
                    
                  }else {
                    addPage(temp, i);
                    fragment.appendChild(temp);
                  }
            }else {
                addPage(temp, '...', true);
                fragment.appendChild(temp);
                const newTemp = pageItemTemp.cloneNode(true);
                if(page == calc) addPage(newTemp, calc, false, ['active']);
                else addPage(newTemp, calc);
                fragment.appendChild(newTemp);
                break;
            }

            counter++;
            continue;  
        }
        
        addPage(temp, i);
        fragment.appendChild(temp);     
    }

    pagination.children[0].after(fragment);

}

function addPage(temp, text, isDisabled = false, props = []) {
    temp.querySelector('.js-page-link').textContent = text;
    temp.querySelector('.js-page-link').dataset.id = text;
    if(page == text) temp.querySelector('.js-page-item').classList.add('active');
    if(isDisabled) {
        temp.querySelector('.js-page-item').classList.add('disabled');
        temp.querySelector('.js-page-item').setAttribute('disabled', true);
    }
    if(props.length) {
        props.forEach(className => {
            temp.querySelector('.js-page-item').classList.add(className);
        })
    }
}


function mode() {
    const modeBtn = document.querySelector('.js-mode-btn');
    if(!localStorage.getItem('mode')) {
        applyMode('dark');
        localStorage.setItem('mode', 'dark');
    }else {
        applyMode(localStorage.getItem('mode'));
    }
    
    modeBtn.addEventListener('click', (evt) => {
        const mode = localStorage.getItem('mode') || 'dark';
        if(mode === 'dark') {
            modeBtn.textContent = '🌙 Dark';
            document.body.classList.add('light');
            document.body.classList.remove('bg-dark');
            localStorage.setItem('mode', 'light');
        }

        if(mode === 'light') {
            modeBtn.textContent = '☀️ Light';
            document.body.classList.remove('light');
            document.body.classList.add('bg-dark');
            localStorage.setItem('mode', 'dark');
        }
       
    });

    function applyMode(mode) {
        if(mode === 'light') {
            modeBtn.textContent = '🌙 Dark';
            document.body.classList.add('light');
            document.body.classList.remove('bg-dark'); 
        }

        if(mode === 'dark') {
            modeBtn.textContent = '☀️ Light';
            document.body.classList.remove('light');
            document.body.classList.add('bg-dark');
        }
    }
}


function addDisabled(item, add = true) {
    if(!add) {
        item.classList.remove('disabled');
        item.removeAttribute('disabled'); 
        return;
    }
    item.classList.add('disabled');
    item.setAttribute('disabled', true);
}
