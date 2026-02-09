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

import React, { useEffect, useState } from 'react';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  getSystemName,
} from '../../helpers';
import Turnstile from '../common/Turnstile';
import { IconMail } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PasswordResetForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
  });
  const { email } = inputs;

  const [loading, setLoading] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const logo = getLogo() || '/B站狗头.png';
  const systemName = getSystemName();

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  function handleChange(value) {
    setInputs((inputs) => ({ ...inputs, email: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      showError('请输入邮箱地址');
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setDisableButton(true);
    setLoading(true);
    try {
      const res = await API.get(
        `/api/reset_password?email=${email}&turnstile=${turnstileToken}`,
      );
      const { success, message } = res.data;
      if (success) {
        showSuccess('重置邮件发送成功，请检查邮箱！');
        setInputs({ ...inputs, email: '' });
      } else {
        showError(message);
      }
    } catch (error) {
        showError('发送失败，请重试');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 pt-24">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="group mb-6">
            <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:border-zinc-700">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">密码重置</h1>
          <p className="text-zinc-400 text-sm">
            找回您的账户密码
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">邮箱</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IconMail className="text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="请输入您的邮箱地址"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || disableButton}
              className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {disableButton
                ? `重试 (${countdown})`
                : '提交'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500">想起来了？</span>
            <Link to="/login" className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
              登录
            </Link>
          </div>

          {turnstileEnabled && (
            <div className="flex justify-center mt-6">
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;
