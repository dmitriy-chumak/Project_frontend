let allCosts = [];
const localhost = 'http://localhost:8000/costs';
const headers = {
  "Content-Type": "application/json;charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

const validationString = (text) => {
  return (text.trim() !== '');
}

const validationSpend = (num) => {
  return (Number(num) > 1);
}

window.onload = () => {
  getAllCost();
}

const getAllCost = async () => {
  try {
    const response = await fetch(localhost, {
      method: 'GET',
    });
    const result = await response.json();
    allCosts = result.data;
    render();
  } catch (error) {
    printError('Error get costs')
  }
}

const addCost = async () => {
  try{  
    const inputName = document.getElementById('input-name');
    const inputNumber = document.getElementById('input-number');

    if (inputName === null || inputNumber === null) {
      return;
    }

    if (!validationString(inputName.value) || !validationSpend(inputNumber.value)) {
      printError('Incorrect input data. Please rewrite');
      return;
    }

    const response = await fetch(localhost, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: inputName.value,
        spend: Number(inputNumber.value),
      }),
    });
    const result = await response.json();

    if (!result._id) {
      throw new Error();
    }

    allCosts.push(result);

    inputName.value = '';
    inputNumber.value = '';
    render();
  } catch (error) {
    printError('Error add cost');
  }
}

const render = () => {
  const costsList = document.getElementById('container-costs');
  if (costsList === null) {
    return;
  }

  while(costsList.firstChild) {
    costsList.removeChild(costsList.firstChild);
  }

  printError('');
  const copyCosts = [...allCosts];
  copyCosts.forEach(element => {
    const { name, date, spend, _id: id } = element;
    const listItem = document.createElement('li');
    listItem.classList = 'list-item';
    const container = document.createElement('div');
    container.classList = 'list-item__container';
    container.id = `container${id}`;

    const nameShop = document.createElement('p');
    nameShop.classList = 'text list-item__name';
    nameShop.innerText = name;
    container.appendChild(nameShop);

    const dateAndValue = document.createElement('div');
    dateAndValue.classList = 'list-item__date-and-value';

    const dateCost = document.createElement('p');
    dateCost.classList = 'text list-item__date-and-value_width';
    dateCost.innerText = moment(date).format('YYYY-MM-DD');
    dateAndValue.appendChild(dateCost);

    const sumSpend = document.createElement('p');
    sumSpend.classList = 'text list-item__date-and-value_width-item';
    sumSpend.innerText = spend + ' p.';
    dateAndValue.appendChild(sumSpend);

    const changeButton = document.createElement('button');
    changeButton.classList = 'list-item__button';
    const changeImg = document.createElement('img');
    changeImg.classList = 'button__image';
    changeImg.src = './image/edit.svg';
    changeImg.alt = 'Edit';
    changeButton.appendChild(changeImg);
    changeButton.onclick = () => {
      changeCost(id);
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList = 'list-item__button';
    const deleteImg = document.createElement('img');
    deleteImg.classList = 'button__image';
    deleteImg.src = './image/trash.svg';
    deleteImg.alt = 'Delete';
    deleteButton.appendChild(deleteImg);
    deleteButton.onclick = () => {
      deleteCost(id);
    }

    const buttons = document.createElement('div');
    buttons.classList = 'list-item__buttons';

    buttons.appendChild(changeButton);
    buttons.appendChild(deleteButton);
    dateAndValue.appendChild(buttons);
    container.appendChild(dateAndValue);
    listItem.appendChild(container);
    costsList.appendChild(listItem);
  });

  const sum = document.getElementById('sum-costs');
  const sumPrice = allCosts.reduce((memo, num) => {
    return (memo + Number(num.spend))
  }, 0);
  sum.innerText = sumPrice;
}

const deleteCost = async (id) => {
  try {  
    const response = await fetch(`${localhost}/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    if (result.deletedCount !== 1) {
      throw new Error();
    }

    allCosts = allCosts.filter(element => element._id !== id);
    render();
  } catch (error) {
    printError('Error delete');
  }
}

const changeCost = (id) => {
  const changeContainer = document.getElementById(`container${id}`);

  if (changeContainer === null) {
    return;
  }
  changeContainer.classList = 'change-container';

  while (changeContainer.firstChild) {
    changeContainer.removeChild(changeContainer.firstChild);
  }

  const { name, spend, date } = allCosts.find(element => element._id === id);

  const inputChangeName = document.createElement('input');
  inputChangeName.type = 'text';
  inputChangeName.classList = 'input-change';
  inputChangeName.value = name;

  const inputChangeDate = document.createElement('input');
  inputChangeDate.type = 'date';
  inputChangeDate.classList = 'input-change';
  inputChangeDate.value = moment(date).format('YYYY-MM-DD');

  const inputChangeValue = document.createElement('input');
  inputChangeValue.type = 'number';
  inputChangeValue.classList = 'input-change';
  inputChangeValue.min = 1;
  inputChangeValue.value = spend;

  const buttonConfirm = document.createElement('button');
  buttonConfirm.classList = 'list-item__button';
  const imageConfirm = document.createElement('img');
  imageConfirm.classList = 'button__image';
  imageConfirm.src = './image/check.svg';
  imageConfirm.alt = 'Confirm';
  buttonConfirm.onclick = () => {
    confirmChange(id, inputChangeName.value, inputChangeDate.value, inputChangeValue.value);
  }

  const buttonCancel = document.createElement('button');
  buttonCancel.classList = 'list-item__button';
  const imageCancel = document.createElement('img');
  imageCancel.classList = 'button__image';
  imageCancel.src = './image/times.svg';
  imageCancel.alt = 'Cancel';
  buttonCancel.onclick = () => {
    render();
  }

  buttonConfirm.appendChild(imageConfirm);
  buttonCancel.appendChild(imageCancel);
  const buttons = document.createElement('div');
  buttons.classList = 'list-item__buttons'
  buttons.appendChild(buttonConfirm)
  buttons.appendChild(buttonCancel);
  changeContainer.appendChild(inputChangeName);
  changeContainer.appendChild(inputChangeDate);
  changeContainer.appendChild(inputChangeValue);
  changeContainer.appendChild(buttons);
}

const confirmChange = async (id, name, date, spend) => {
  if (!validationString(name) 
    || !validationString(date) 
    || !validationSpend(spend)
  ) {
    printError('Incorect change data.');
    return;
  }

  try {
    const response = await fetch(`${localhost}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        name: name,
        date: date,
        spend: Number(spend)
      }),
    });

    const result = await response.json();

    if (result._id !== id) {
      throw new Error();
    }

    allCosts.forEach(element => {
      if (element._id === result._id) {
        element = result;
      }
    });
    render();
  } catch (error) {
    printError('Error confirm change');
  }
}

const printError = (text) => {
  const errorBox = document.getElementById('error-box');

  if (errorBox === null) {
    return;
  }

  errorBox.innerText = text;
}