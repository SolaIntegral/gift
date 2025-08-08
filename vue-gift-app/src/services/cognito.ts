import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js'

// Cognito設定
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID

if (!userPoolId || !clientId) {
  console.error('Missing Cognito environment variables:')
  console.error('VITE_COGNITO_USER_POOL_ID:', userPoolId ? '✓ Set' : '✗ Missing')
  console.error('VITE_COGNITO_CLIENT_ID:', clientId ? '✓ Set' : '✗ Missing')
  
  if (import.meta.env.DEV) {
    console.warn('Please create a .env.local file with your Cognito credentials')
    console.warn('See .env.example for the required format')
  }
  
  throw new Error('Missing Cognito environment variables. Check console for details.')
}

const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
})

// 認証状態の管理
let currentUser: CognitoUser | null = null
let authToken: string | null = null

// 認証サービスクラス
export class CognitoAuthService {
  // サインアップ
  static async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name,
        }),
      ]

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          console.error('Sign up error:', err)
          resolve({ success: false, error: err.message })
          return
        }

        if (result) {
          console.log('Sign up successful:', result)
          resolve({ success: true })
        }
      })
    })
  }

  // サインイン
  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    return new Promise((resolve) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      })

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log('Sign in successful:', result)
          currentUser = cognitoUser
          authToken = result.getIdToken().getJwtToken()
          resolve({ success: true, user: cognitoUser })
        },
        onFailure: (err) => {
          console.error('Sign in error:', err)
          resolve({ success: false, error: err.message })
        },
      })
    })
  }

  // サインアウト
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (currentUser) {
        currentUser.signOut(() => {
          console.log('Sign out successful')
          currentUser = null
          authToken = null
          resolve({ success: true })
        })
      } else {
        resolve({ success: true })
      }
    })
  }

  // 現在のユーザーを取得
  static getCurrentUser(): CognitoUser | null {
    return currentUser || userPool.getCurrentUser()
  }

  // 認証トークンを取得
  static async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      const user = this.getCurrentUser()
      if (!user) {
        resolve(null)
        return
      }

      user.getSession((err, session) => {
        if (err) {
          console.error('Get session error:', err)
          resolve(null)
          return
        }

        if (session && session.isValid()) {
          authToken = session.getIdToken().getJwtToken()
          resolve(authToken)
        } else {
          resolve(null)
        }
      })
    })
  }

  // 認証状態を確認
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    return !!token
  }

  // パスワードリセット
  static async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.forgotPassword({
        onSuccess: () => {
          console.log('Password reset email sent')
          resolve({ success: true })
        },
        onFailure: (err) => {
          console.error('Forgot password error:', err)
          resolve({ success: false, error: err.message })
        },
      })
    })
  }

  // パスワード確認
  static async confirmPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      })

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          console.log('Password confirmed successfully')
          resolve({ success: true })
        },
        onFailure: (err) => {
          console.error('Confirm password error:', err)
          resolve({ success: false, error: err.message })
        },
      })
    })
  }

  // ユーザー属性を取得
  static async getUserAttributes(): Promise<{ success: boolean; attributes?: any; error?: string }> {
    return new Promise((resolve) => {
      const user = this.getCurrentUser()
      if (!user) {
        resolve({ success: false, error: 'No authenticated user' })
        return
      }

      user.getUserAttributes((err, attributes) => {
        if (err) {
          console.error('Get user attributes error:', err)
          resolve({ success: false, error: err.message })
          return
        }

        const userAttributes: any = {}
        attributes?.forEach((attr) => {
          userAttributes[attr.getName()] = attr.getValue()
        })

        resolve({ success: true, attributes: userAttributes })
      })
    })
  }

  // ユーザー属性を更新
  static async updateUserAttributes(attributes: { [key: string]: string }): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const user = this.getCurrentUser()
      if (!user) {
        resolve({ success: false, error: 'No authenticated user' })
        return
      }

      const attributeList = Object.entries(attributes).map(
        ([key, value]) =>
          new CognitoUserAttribute({
            Name: key,
            Value: value,
          })
      )

      user.updateAttributes(attributeList, (err, result) => {
        if (err) {
          console.error('Update user attributes error:', err)
          resolve({ success: false, error: err.message })
          return
        }

        console.log('User attributes updated:', result)
        resolve({ success: true })
      })
    })
  }
}

// 認証状態の監視
userPool.getCurrentUser()?.getSession((err, session) => {
  if (err) {
    console.error('Session check error:', err)
    return
  }

  if (session && session.isValid()) {
    currentUser = userPool.getCurrentUser()
    authToken = session.getIdToken().getJwtToken()
    console.log('User session restored')
  }
})

export default CognitoAuthService 