import { useState } from "react"
import { Input, Button, message } from "antd";
import './index.css'

const Login = ({ init }: { init: Function }) => {
  const [username, setUsername] = useState("");

  const tohone = () => {
    if (username) {
      init(username)
    } else {
      message.error('请输入名称！');
    }
  }
  return (
    <div className="login">
      <div className="login-box">
        <h2>请留下的大名</h2>
        <Input style={{ margin: '10px 0 20px 0' }} value={username} onChange={(val) => setUsername(val.target.value)} />
        <Button type="primary" onClick={tohone}>进入大厅</Button>
      </div>
    </div>
  )
}

export default Login