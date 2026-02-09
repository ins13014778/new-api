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
  copy,
  showError,
  showNotice,
  getLogo,
  getSystemName,
} from '../../helpers';
import { useSearchParams, Link } from 'react-router-dom';
import { IconMail, IconLock, IconCopy } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const PasswordResetConfirm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
    token: '',
  });
  const { email, token } = inputs;
  const isValidResetLink = email && token;

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const logo = getLogo() || '/B站狗头.png';
  const systemName = getSystemName();

  useEffect(() => {
    let token = searchParams.get('token');
    let email = searchParams.get('email');
    setInputs({
      token: token || '',
      email: email || '',
    });
  }, [searchParams]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !token) {
      showError('无效的重置链接，请重新发起密码重置请求');
      return;
    }
    setDisableButton(true);
    setLoading(true);
    try {
      const res = await API.post(`/api/user/reset`, {
        email,
        token,
      });
      const { success, message } = res.data;
      if (success) {
        let password = res.data.data;
        setNewPassword(password);
        await copy(password);
        showNotice(`密码已重置并已复制到剪贴板：${password}`);
      } else {
        showError(message);
      }
    } catch (error) {
        showError('重置失败，请重试');
    } finally {
        setLoading(false);
    }
  }

  const handleCopyPassword = async () => {
      await copy(newPassword);
      showNotice(`密码已复制到剪贴板：${newPassword}`);
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">密码重置确认</h1>
          <p className="text-zinc-400 text-sm">
            设置您的新密码
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isValidResetLink && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    无效的重置链接，请重新发起密码重置请求
                </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">邮箱</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IconMail className="text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  placeholder="等待获取邮箱信息..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-500 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {newPassword && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 ml-1">新密码</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IconLock className="text-zinc-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={newPassword}
                            readOnly
                            className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                        <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="复制"
                        >
                            <IconCopy />
                        </button>
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={disableButton || newPassword || !isValidResetLink}
              className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {newPassword ? '密码重置完成' : '确认重置密码'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              返回登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
