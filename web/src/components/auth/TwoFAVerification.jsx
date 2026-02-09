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

import React, { useState } from 'react';
import { API, showError, showSuccess } from '../../helpers';
import { IconLock, IconKey } from '@douyinfe/semi-icons';

const TwoFAVerification = ({ onSuccess, onBack, isModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      showError('请输入验证码');
      return;
    }
    // Validate code format
    if (useBackupCode && verificationCode.length !== 8) {
      showError('备用码必须是8位');
      return;
    } else if (!useBackupCode && !/^\d{6}$/.test(verificationCode)) {
      showError('验证码必须是6位数字');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/login/2fa', {
        code: verificationCode,
      });

      if (res.data.success) {
        showSuccess('登录成功');
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(res.data.data));
        if (onSuccess) {
          onSuccess(res.data.data);
        }
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={isModal ? "" : "bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl"}>
      <div className="text-center mb-6">
        {!isModal && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shadow-lg">
              <IconLock className="text-white" size="large"/>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold text-white">两步验证</h2>
        <p className="text-zinc-400 text-sm mt-2">
          请输入认证器应用显示的验证码完成登录
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 ml-1">
            {useBackupCode ? '备用码' : '验证码'}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {useBackupCode ? 
                <IconKey className="text-zinc-500 group-focus-within:text-white transition-colors" /> :
                <IconLock className="text-zinc-500 group-focus-within:text-white transition-colors" />
              }
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={useBackupCode ? '请输入8位备用码' : '请输入6位数字验证码'}
              className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '验证中...' : '验证并登录'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 items-center text-sm">
        <button
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setVerificationCode('');
          }}
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          {useBackupCode ? '使用认证器验证码' : '使用备用码'}
        </button>
        
        {onBack && (
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            返回登录
          </button>
        )}
      </div>

      <div className="mt-6 p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <strong className="text-zinc-400 block mb-1">提示：</strong>
          • 验证码每30秒更新一次<br/>
          • 如果无法获取验证码，请使用备用码<br/>
          • 每个备用码只能使用一次
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 pt-24">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {content}
      </div>
    </div>
  );
};

export default TwoFAVerification;
