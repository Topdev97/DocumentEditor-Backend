'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { PATH, STORAGE_KEY } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { sign } from "@/services/api";
import { signIn } from "next-auth/react";
import Logo_Image from '@/public/logo/logo.png'
import Input from "@/components/atoms/input";
import Button from "@/components/atoms/button";
import EffectImage1 from '@/public/effect/effect-image1.png'
import BotAlert from '@/components/BotAlert'

const SignIn = () => {
    const [access_token, setAccessToken] = useLocalStorage(STORAGE_KEY.ACCESS_TOKEN, undefined);
    const [user_id, setUserID] = useLocalStorage(STORAGE_KEY.USER_ID, undefined);
    const today = new Date;
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isRemember, setIsRemember] = useState<boolean>(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [variant, setVariant] = useState('');

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setIsRemember(checked);
    };

    const onClickSignIn = async (action: string) => {
        if (action == "credentials") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError('Please enter a valid email address.');
            } else {
                setEmailError('');
            }
            if (password.length < 8) {
                setPasswordError('Must be at least 8 characters.');
            } else {
                setPasswordError('');
            }
            if (emailError == "" && passwordError == "") {
                const userInfo: any = await sign(email, password);
                console.log(userInfo, 'userInfo');
                if (userInfo?.accessToken !== "") {
                    if (userInfo.message == 'incorrectPassword') {
                        setAlertMessage('Incorrect the Password!');
                        setVariant('error');
                        setAlert(true);
                    } else if (userInfo.message == 'nofound') {
                        setAlertMessage('No found User!');
                        setVariant('error');
                        setAlert(true);
                    } else {
                        setAccessToken(userInfo?.accessToken);
                        setUserID(userInfo?.user?._id);
                        setAlertMessage('Successfully Signed In!');
                        setVariant('success');
                        setAlert(true);
                        setTimeout(() => {
                            window.location.href = PATH.DASHBOARD;
                        }, 2000)
                    }
                }
            }
        }
        if (action == "google") {
            signIn("google")
        }
    }
    return (
        <div className="flex w-full">
            <div className="xl:w-2/5 w-full relative bg-[#151E36] min-h-[100vh]">
                <div className="sm:p-14 p-5">
                    <Link href='/'><Image src={Logo_Image} width={166} height={45} alt="logo_file" /></Link>
                    <div className="xl:w-[75%] w-full ">
                        <div className="text-center py-10">
                            <h1 className="text-white xl:text-[50px] text-[40px]">Login</h1>
                            <p className="text-white text-[16px] mt-3">We'll check if you have an account and help you create one if you don't.</p>
                        </div>
                        <Input className="" type="mail" label="Email" name="email-input" placeholder="Enter email" value={email} setValue={setEmail} />
                        {emailError != '' && (<p className="text-[red] mt-1">{emailError}</p>)}
                        <Input className="mt-5" type="password" label="Password" name="password-input" placeholder="Password" value={password} setValue={setPassword} />
                        {passwordError != '' && (<p className="text-[red] mt-1">{passwordError}</p>)}
                        <div className="mt-5 flex justify-between items-center">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember-password" className="relative w-[20px] h-[20px]" checked={isRemember} onChange={handleCheckboxChange} />
                                <label htmlFor="remember-password" className="pl-2 text-white">Stay logged in</label>
                            </div>
                        </div>
                        <Button label="Log In" className="w-full mt-6" onClick={() => onClickSignIn("credentials")} />
                        <Link href='/forgot-password' className="mt-5 block"><p className="text-[#5596E5] w-full text-center">I forget my password</p></Link>
                        <div className="flex items-center w-full justify-center mt-5 gap-3">
                            <p className="text-white">Don't have an account yet?</p>  <Link href='/sign-up' className="block"><p className="text-[#5596E5] w-full text-center">Sign Up</p></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="xl:block hidden w-3/5 bg-gradient-to-r from-[#569BE7] to-[#4A60D5] h-screen">

            </div>
            <BotAlert message={alertMessage} show={alert} setShow={setAlert} variant={variant} />
        </div>
    )
}


export default SignIn;