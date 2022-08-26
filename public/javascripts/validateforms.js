
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validate-form')
    console.log(Array.from(forms));
    // Loop over them and prevent submission
    Array.from(forms).forEach((form, index) => {
        console.log(index);
        form.addEventListener('submit', event => {
            console.log("I am Neo");
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()