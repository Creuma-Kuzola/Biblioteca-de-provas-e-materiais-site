import React, { useEffect, useState } from 'react'
import { Route, Switch } from 'react-router'
import { Link } from 'react-router-dom'
import { isValidToken } from '../../../services/auth/authService'
import { getActualUserData } from '../../../services/remote/user/user'
import AutoGeneratedImage from '../../profile/AutoGeneratedImage'
import ShowNotificationContainer from '../notification/ShowNotificationContainer'

export default function Menu() {
  const [showLoginButton, setShowLoginButton] = useState(true)
  const [hasAdminRole, setHasAdminRole] = useState(false)
  const [userHasNotification, setUserHasNotification] = useState(false)
  const [quantUserNotification, setQuantUserNotification] = useState(0)
  const [userProfilePicture, setUserProfilePicture] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [showNotificationMainContainer, setShowNotificationMainContainer] = useState(false)

  const verifyTokenValidation = React.useCallback(async () => {
    const res = await isValidToken()
    setShowLoginButton(!res)
  }, [])

  const verifyAdminRole = async (user) => {
    setHasAdminRole(user.roles.includes('admin'))
  }

  const verifyUserRole = React.useCallback(async () => {
    const res = await getActualUserData();

    if (res.data !== undefined) {
      const user = res.data.user
      setQuantUserNotification(user.quantNewNotifications)
      setUserHasNotification(user.hasNewNotifications)
      if (user.username !== undefined) {
        setUsername(user.username)
      }
      setEmail(user.email)
      setUserProfilePicture(user.profilePicture)
      verifyAdminRole(user)
    } else {
      localStorage.removeItem('auth-token-biblioteca-de-provas')
    }
  }, [])

  const handleShowNotificationContainer = (newShowNotificationContainer) => {
    setShowNotificationMainContainer(newShowNotificationContainer)
    setQuantUserNotification(0)
    setUserHasNotification(false)
  }

  useEffect(() => {
    try {
      verifyTokenValidation()
      verifyUserRole()
    } catch (error) {
      console.log(error)
    }
  }, [verifyUserRole, verifyTokenValidation])

  return (
    <Switch>
      <Route path="/biblioteca-de-provas-e-materiais-site">
        <div className="menu-container">
          <Link to="/biblioteca-de-provas-e-materiais-site/" className="menu-link">Home</Link>
          <Link to="/biblioteca-de-provas-e-materiais-site/about" className="menu-link">Sobre</Link>
          {
            showLoginButton &&
            <Link to="/biblioteca-de-provas-e-materiais-site/login" className="menu-link">Login</Link>
          }
          <Link to="/biblioteca-de-provas-e-materiais-site/contributers" className="menu-link">Contribuidores</Link>
          <Link to="/biblioteca-de-provas-e-materiais-site/contribute" className="menu-link contribute-link">Contribua</Link>
          {
            hasAdminRole &&
            <Link to="/biblioteca-de-provas-e-materiais-site/admin" className="menu-link admin-menu-link">Admin</Link>
          }
          {
            !showLoginButton &&
            <>
              <div className="dropdown">
                <div className="dropbtn" onClick={() => {
                  setShowNotificationMainContainer(false)
                }}>
                  <div className="user-profile-picture">
                    {username !== '' &&
                      <AutoGeneratedImage
                        username={username !== '' ? username : email}
                      />
                    }

                  </div>
                </div>


                <div className="dropdown-content">
                  <Link to="/biblioteca-de-provas-e-materiais-site/user" className="menu-link">Profile</Link>
                  <button className="menu-link"
                    onClick={() => {
                      setShowNotificationMainContainer(true)
                    }}>
                    Notificações
                    {
                      userHasNotification === true &&
                      <span className="quant-notifications">
                        {quantUserNotification}
                      </span>
                    }
                  </button>
                  <Link to="/biblioteca-de-provas-e-materiais-site/" className="menu-link logout-button" onClick={() => {
                    localStorage.setItem('auth-token-biblioteca-de-provas', '')
                    setShowLoginButton(true)
                    setHasAdminRole(false)
                  }}>Logout</Link>
                </div>

                {showNotificationMainContainer &&
                  <div className="user-notification-container dropdown-content">
                    <ShowNotificationContainer handleShowNotificationContainer={handleShowNotificationContainer}></ShowNotificationContainer>
                  </div>
                }


              </div>
            </>
          }

        </div>
      </Route>
    </Switch>
  )
}
