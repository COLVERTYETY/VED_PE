document.addEventListener('click', function handleClick(event) {
    console.log('user clicked: ', event.target);
    if (event.target.classList.contains('customButton')) {
        console.log('user clicked: ', event.target.innerHTML);
        var file = event.target.innerHTML;
        fetch("/data", {
            method: "POST", 
            body: file
          }).then(res => {
            console.log("Request complete! response:", res);
          });
    }
  });