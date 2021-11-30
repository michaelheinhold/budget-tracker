let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded =  function(event) {
  db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    updateTransactions();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('new_transaction');
  transactionObjectStore.add(record);
}

function updateTransactions() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('new_transaction');
  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0 ){
      fetch('/api/transaction', {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        response.json()
      })
      .then(() => {
        const transaction = db.transaction(['new_transaction'], 'readwrite');
        const transactionObjectStore = transaction.objectStore('new_transaction');

        transactionObjectStore.clear();

        alert('All transactions have been uploaded!')
      })
      .catch(err => { 
        console.log(err) 
      });
    }
  }
}

window.addEventListener('online', updateTransactions);