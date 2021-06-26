import React from 'react'

function LoggedInName() {
  //     try {
  if (!localStorage.getItem('user_data')) {
    window.location.href = '/'
  }
  if (!localStorage.getItem('token_data')) {
    window.location.href = '/'
  }
  var _ud = localStorage.getItem('user_data')
  var ud = JSON.parse(_ud)
  //     var userId = ud.id; ---------------------------------------- unused
  var firstName = ud.firstName
  var lastName = ud.lastName

  // } catch (error) {
  //     // console.log(error);
  //     window.location.href = '/';
  //     return;
  // }

  const doLogout = (event) => {
    event.preventDefault()

    localStorage.removeItem('user_data')
    localStorage.removeItem('token_data')
    window.location.href = '/'
  }
  return (
    <div id="loggedInDiv">
      <span id="userName">
        Logged In As {firstName} {lastName}
      </span>
      <br />
      <button
        type="button"
        id="logoutButton"
        className="buttons"
        onClick={doLogout}>
        {' '}
        Log Out{' '}
      </button>
         
    </div>
  )
}

export default LoggedInName
