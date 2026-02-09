/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
  getSystemName,
  setUserData,
  onGitHubOAuthClicked,
  onDiscordOAuthClicked,
  onOIDCClicked,
  onLinuxDOOAuthClicked,
  onCustomOAuthClicked,
  prepareCredentialRequestOptions,
  buildAssertionResult,
  isPasskeySupported,
} from '../../helpers';
import Turnstile from '../common/Turnstile';
import { IconChevronRight } from '@douyinfe/semi-icons';
import {
  IconGithubLogo,
  IconMail,
  IconLock,
} from '@douyinfe/semi-icons';
import OIDCIcon from '../common/logo/OIDCIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import TwoFAVerification from './TwoFAVerification';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';
import TelegramLoginButton from 'react-telegram-login';
import { Modal } from '@douyinfe/semi-ui';

const LoginForm = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: '',
  });
  const { username, password } = inputs;
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [customOAuthLoading, setCustomOAuthLoading] = useState({});
  const [show2FA, setShow2FA] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const logo = getLogo() || '/B站狗头.png';
  const systemName = getSystemName();

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError('未登录或登录已过期，请重新登录');
    }
    
    // Check status
    if (statusState?.status) {
      if (statusState.status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(statusState.status.turnstile_site_key);
      }
    }
  }, [searchParams, statusState?.status]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const handlePasskeyLogin = async () => {
    if (!isPasskeySupported()) {
      showError('您的浏览器不支持 Passkey');
      return;
    }
    
    setPasskeyLoading(true);
    try {
      const optionsRes = await API.get('/api/user/webauthn/login/options');
      const { success, message, data } = optionsRes.data;
      if (!success) {
        showError(message);
        setPasskeyLoading(false);
        return;
      }

      const options = prepareCredentialRequestOptions(data);
      const credential = await navigator.credentials.get({
        publicKey: options,
      });

      const assertionResult = buildAssertionResult(credential);
      const verifyRes = await API.post(
        '/api/user/webauthn/login/verify',
        assertionResult,
      );
      
      const verifyData = verifyRes.data;
      if (verifyData.success) {
        if (verifyData.data.require_2fa) {
          setLoginResponse(verifyData);
          setShow2FA(true);
        } else {
          userDispatch({ type: 'login', payload: verifyData.data });
          setUserData(verifyData.data);
          updateAPI(verifyData.data.token);
          showSuccess('登录成功！');
          navigate('/console');
        }
      } else {
        showError(verifyData.message);
      }
    } catch (error) {
      console.error(error);
      showError('Passkey 登录失败：' + error.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setSubmitted(true);
    setLoginLoading(true);
    
    try {
      if (turnstileEnabled && !turnstileToken) {
        showInfo('请稍后，正在进行人机校验');
        setLoginLoading(false);
        return;
      }

      const res = await API.post(`/api/user/login?turnstile=${turnstileToken}`, {
        username,
        password,
      });
      
      const { success, message, data } = res.data;
      if (success) {
        if (data.require_2fa) {
          setLoginResponse(res.data);
          setShow2FA(true);
        } else {
          userDispatch({ type: 'login', payload: data });
          setUserData(data);
          updateAPI(data.token);
          showSuccess('登录成功！');
          navigate('/console');
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请稍后重试');
    } finally {
      setLoginLoading(false);
    }
  };

  const onWeChatLogin = async () => {
    if (!inputs.wechat_verification_code) return;
    setWechatLoading(true);
    try {
      const res = await API.get(
        `/api/oauth/wechat?code=${inputs.wechat_verification_code}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        setUserData(data);
        updateAPI(data.token);
        setShowWeChatLoginModal(false);
        showSuccess('登录成功！');
        navigate('/console');
      } else {
        showError(message);
      }
    } catch (error) {
      showError('微信登录失败');
    } finally {
      setWechatLoading(false);
    }
  };

  const handleCustomOAuth = async (provider) => {
    setCustomOAuthLoading(prev => ({ ...prev, [provider.id]: true }));
    try {
      await onCustomOAuthClicked(provider.id);
    } catch (error) {
      showError('登录失败');
    } finally {
      setCustomOAuthLoading(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  if (show2FA) {
    return (
      <TwoFAVerification
        loginResponse={loginResponse}
        onCancel={() => setShow2FA(false)}
        onSuccess={(data) => {
          userDispatch({ type: 'login', payload: data });
          setUserData(data);
          updateAPI(data.token);
          showSuccess('登录成功！');
          navigate('/console');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 pt-24">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="group mb-6">
            <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:border-zinc-700">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">登录</h1>
          <p className="text-zinc-400 text-sm">
            欢迎回到 {systemName}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">用户名 / 邮箱</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IconMail className="text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={handleInputChange}
                  placeholder="请输入用户名或邮箱"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-zinc-400">密码</label>
                <Link to="/reset" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  忘记密码？
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IconLock className="text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {turnstileEnabled && (
              <div className="flex justify-center py-2">
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => setTurnstileToken(token)}
                  theme="dark"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-zinc-200 focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loginLoading ? '登录中...' : (
                <>
                  <span>登录</span>
                  <IconChevronRight className="opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-4 text-zinc-500 tracking-wider font-medium">或其他方式登录</span>
            </div>
          </div>

          {/* Social Login Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statusState?.status?.github_oauth_enabled && (
              <button
                onClick={() => onGitHubOAuthClicked(statusState.status.github_client_id)}
                disabled={githubLoading}
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl border border-zinc-700 transition-all"
              >
                <IconGithubLogo />
                <span className="text-sm font-medium">GitHub</span>
              </button>
            )}
            
            {statusState?.status?.wechat_login_enabled && (
              <button
                onClick={() => setShowWeChatLoginModal(true)}
                className="flex items-center justify-center gap-2 bg-[#07C160]/10 hover:bg-[#07C160]/20 text-[#07C160] py-2.5 rounded-xl border border-[#07C160]/20 transition-all"
              >
                <WeChatIcon />
                <span className="text-sm font-medium">WeChat</span>
              </button>
            )}

            {statusState?.status?.discord_oauth_enabled && (
              <button
                onClick={() => onDiscordOAuthClicked(statusState.status.discord_client_id)}
                disabled={discordLoading}
                className="flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] py-2.5 rounded-xl border border-[#5865F2]/20 transition-all"
              >
                <SiDiscord />
                <span className="text-sm font-medium">Discord</span>
              </button>
            )}

            {statusState?.status?.linuxdo_oauth_enabled && (
              <button
                onClick={() => onLinuxDOOAuthClicked(statusState.status.linuxdo_client_id)}
                disabled={linuxdoLoading}
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl border border-zinc-700 transition-all"
              >
                <LinuxDoIcon />
                <span className="text-sm font-medium">Linux DO</span>
              </button>
            )}

            {statusState?.status?.oidc_oauth_enabled && (
              <button
                onClick={() => onOIDCClicked(statusState.status.oidc_client_id, statusState.status.oidc_authorization_endpoint)}
                disabled={oidcLoading}
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl border border-zinc-700 transition-all"
              >
                <OIDCIcon />
                <span className="text-sm font-medium">OIDC</span>
              </button>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              还没有账号？ {' '}
              <Link to="/register" className="text-white hover:text-blue-400 font-medium transition-colors">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* WeChat Modal */}
      {showWeChatLoginModal && (
        <Modal
          visible={showWeChatLoginModal}
          onCancel={() => setShowWeChatLoginModal(false)}
          footer={null}
          width={360}
          className="!bg-zinc-900 !border-zinc-800"
          bodyStyle={{ padding: '24px' }}
          closeIcon={<IconChevronRight className="rotate-45" />}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-6">微信登录</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="wechat_verification_code"
                value={inputs.wechat_verification_code}
                onChange={handleInputChange}
                placeholder="请输入验证码"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={onWeChatLogin}
                disabled={wechatLoading}
                className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-semibold rounded-xl py-3 transition-colors"
              >
                登录
              </button>
              <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-zinc-400 text-sm mb-2">
                  请关注公众号获取验证码：
                </p>
                <img src={statusState?.status?.wechat_qrcode} alt="WeChat QRCode" className="mx-auto w-32 h-32 rounded-lg" />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LoginForm;
