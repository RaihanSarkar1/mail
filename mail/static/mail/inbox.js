// Load from history bugged **
window.onpopstate = function(event) {
  console.log(event.state.page);
  load_mailbox(event.state.page);
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  //Send an email using post API call
  document.querySelector('#compose-form').onsubmit =  function () {
    recipents_list = document.querySelector('#compose-recipients').value
    subject_text = document.querySelector('#compose-subject').value
    body_text = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipents_list,
          subject: subject_text,
          body: body_text
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    //redirect to sent mail
    load_mailbox('sent');

    //Prevent default submission of form
    return false
  }

  

 
 
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_email(email) {
    // Show the email and hide other views
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  //hide the archive unarchive button
  document.querySelector('#archive-button').style.display = 'none';
  document.querySelector('#unarchive-button').style.display = 'none';

  //Create the reply button if it exists then do nothing
  let reply_button = document.querySelector('#reply-button');
  if (reply_button) {

  } else {
    let reply_button = document.createElement('button');
    reply_button.classList.add("btn");
    reply_button.classList.add("btn-primary");
    reply_button.innerHTML = 'Reply'
    reply_button.setAttribute("id", "reply-button");

    document.querySelector('#single-email-view').insertAdjacentElement('beforeend', reply_button);

  }
  

  
  id = email.id;
  route = `/emails/${id}`;
  fetch(route)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      sender = document.querySelector('#email-sender');
      recipients = document.querySelector('#email-recipients');
      subject = document.querySelector('#email-subject');
      timestamp = document.querySelector('#email-timestamp');
      body = document.querySelector('#email-body');

      sender.innerHTML = `Sender: ${email.sender}`;
      recipients.innerHTML = `Recipients: ${email.recipients}`;
      subject.innerHTML = `Subject: ${email.subject}`;
      timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
      body.innerHTML = `${email.body}`;


      // ... do something else with email ...
      //Show archive or unarchive button
      if (email.archived === false) {
        document.querySelector('#archive-button').style.display = 'inline-block';
      } else {
        document.querySelector('#unarchive-button').style.display = 'inline-block';
      }
  });
  fetch(route, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })



  //Archive a message
  document.querySelector('#archive-button').onclick = function (){
    this.style.display = 'none';
    document.querySelector('#unarchive-button').style.display = 'inline-block';
    fetch(route, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }

  //Unarchive a message
  document.querySelector('#unarchive-button').onclick = function (){
    this.style.display = 'none';
    document.querySelector('#archive-button').style.display = 'inline-block';
    fetch(route, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }

  //Reply an email
  document.querySelector('#reply-button').onclick = function (){
    reply_email(email);

  }
  
}

function reply_email(email) {
  compose_email();
  // Fill out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

}

function load_mailbox(mailbox) {

  // Add to history

  history.pushState({page: mailbox}, "", `${mailbox}`);
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //if sent is clicked

  route = `/emails/${mailbox}`
 
  fetch(route)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emails.forEach(email => {
        const div = document.createElement('div');
        // detecting if the div has been clicked
        div.addEventListener('click', function() {
          load_email(email);
        });

        div.style.cursor = 'pointer';
        div.classList.add("border");
        div.classList.add("border-dark");
        div.classList.add("container");
        div.classList.add("p-2");
        if (email.read === true) {
          div.classList.add("bg-secondary");
        }

        const row = document.createElement('div');
        row.classList.add("row");

        const data1 = document.createElement('div');
        const data2 = document.createElement('div');
        const data3 = document.createElement('div');
        data1.classList.add("col");
        data2.classList.add("col");
        data3.classList.add("col");
        data1.innerHTML = email.sender;
        data2.innerHTML = email.subject;
        data3.innerHTML = email.timestamp;
        data1.style.fontWeight = 'bold';
        row.append(data1);
        row.append(data2);
        row.append(data3);
        div.append(row);
        document.querySelector('#emails-view').append(div);

      });
      
  });
  
  
}