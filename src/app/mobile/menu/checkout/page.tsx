'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.87 0H2.13C.95 0 0 .95 0 2.13v15.74C0 19.05.95 20 2.13 20h27.74c1.18 0 2.13-.95 2.13-2.13V2.13C32 .95 31.05 0 29.87 0z" fill="#1A1F71"/>
    <path d="m9.28 14.71-2.9-10.2H3.2l-2.9 10.2H3.5l1.05-3.37h2.6l.51 3.37h3.2zm-2.77-5.1-.81-2.52-.8 2.52h1.6zM13.2 4.51h2.53l1.58 6.78 1.47-6.78H21.3l-2.9 10.2h-3.1L13.2 4.51zM26.27 4.51h3.2v10.2h-3.2V4.51z" fill="#fff"/>
  </svg>
);

const MastercardIcon = () => (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#EB001B"/>
    <path d="M11 10a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" fill="#F79E1B"/>
    <path d="M16 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" fill="#FF5F00"/>
  </svg>
);

const NetworkLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 3112 534"><path fill="#004080" fillOpacity=".3" d="M1198.5 236c0 56.4.1 79.4.2 51.2.2-28.1.2-74.3 0-102.5-.1-28.1-.2-5.1-.2 51.3m-319.2-46.3c1.5.2 3.9.2 5.5 0 1.5-.2.2-.4-2.8-.4s-4.3.2-2.7.4m198.5 0c1.8.2 4.5.2 6 0s0-.4-3.3-.4-4.5.2-2.7.4m640 0c1.8.2 4.5.2 6 0s0-.4-3.3-.4-4.5.2-2.7.4m227.5 0c1.5.2 3.7.2 5 0 1.2-.2 0-.4-2.8-.4-2.7 0-3.8.2-2.2.4m-850 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m609 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m32 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-905.9 18.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-16.1 12.3c0 2.7.2 3.8.4 2.2.2-1.5.2-3.7 0-5-.2-1.2-.4 0-.4 2.8m259.5.2c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m11 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m-216 2c1.8.2 4.5.2 6 0s0-.4-3.3-.4-4.5.2-2.7.4m849 0c1.7.2 4.7.2 6.5 0 1.7-.2.3-.4-3.3-.4s-5 .2-3.2.4m223 3c1.8.2 4.5.2 6 0s0-.4-3.3-.4-4.5.2-2.7.4M1887 286c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-625.2 78.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m7 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m-194.5 2c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m15 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m624 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m13 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-569.9 5.5-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2m97.4 26.5c1.7.2 4.7.2 6.5 0 1.7-.2.3-.4-3.3-.4s-5 .2-3.2.4m-182 2c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m19 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m622 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m15 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"/><path fill="#004080" d="m1199.2 242.7.3 108.8 2.3 7.5c1.3 4.1 3.7 10.1 5.4 13.2 6 11.2 18.9 20.4 32.7 23.4 11.6 2.4 30.3 1.7 43.4-1.7l3.7-1v-30.7l-4.7 1.4c-2.7.8-8.4 1.8-12.8 2.1-15.7 1.1-26.1-4.7-30.1-16.7-1.6-5-1.8-10.9-2.2-64.8l-.3-59.2h50.1v-29h-50v-62h-38.1zM1981 264v130h39V134h-39zM864 193c-9.5 2.4-15.8 5.1-24 10.5-7.5 5-17.4 14.9-21.9 22-4.1 6.5-4.5 5-3.8-14.1l.5-15.4H778v198h38.9l.3-60.3c.4-58.5.4-60.4 2.6-68.2 6.7-24.1 22.6-39.8 43.6-42.8 9-1.3 21.1.1 28.1 3.2 6.7 3 15.1 11.4 18.6 18.8 6.2 12.9 6.2 13.5 6.6 84.5l.4 64.8H956v-61.9c0-35.7-.4-66.2-1-72-3.2-30.8-16.4-51.3-40.5-62.7-13.6-6.4-34.9-8.3-50.5-4.4m195.9-.5c-45.5 8.6-77.2 44.1-82 91.9-4 38.8 12.2 76.2 41.6 96.6 35.1 24.2 88.3 24.6 123.6 1 3.5-2.4 10.4-8.3 15.2-13.2l8.8-9-8.2-6.6c-4.6-3.7-10.5-8.5-13.2-10.7l-5-4-9.1 9c-14.6 14.5-28.8 20.4-49.2 20.5-33.6 0-62.6-24.7-65.2-55.7l-.5-6.3 79.4-.2 79.4-.3.3-7.5c.4-9.8-1.4-26.9-3.8-36.7-9.1-35.6-31-58.5-64.8-67.5-10.2-2.7-36.1-3.4-47.3-1.3m34.4 29c14.9 3.1 27.9 12.7 34.5 25.2 3.8 7.3 7.2 19.7 7.2 26.5v4.8h-119v-2.8c0-4.5 2.8-14.1 6.1-20.8 12.5-25.3 42.2-39.1 71.2-32.9m606-29.1c-14.7 2.8-30.2 9.1-42.1 17-8.5 5.7-21.6 19.1-27.5 28.2-19.1 29.5-21.8 70-6.8 102 13.6 28.9 36.2 47.6 68.8 56.6 6.8 1.9 10.3 2.2 28.3 2.2s21.5-.3 28.3-2.2c43.1-12 71.6-43.2 77.7-85.1 1.7-11.5.8-32.3-1.9-43.1-2.3-9.1-9-24-14.2-31.7-13.6-20.1-35.8-35.4-60.6-41.9-8.2-2.2-12.5-2.7-26.3-3-11.2-.2-18.8.1-23.7 1m39.7 32.2c16.6 5 32 17.8 39.2 32.4 6.5 13.1 8.2 21.4 8.2 38-.1 17.1-1.9 25.4-8.6 38.3-5.8 11.4-17.4 23-27.8 28-9 4.3-20.2 6.7-30.7 6.7-30.5-.1-53.8-18.1-63.5-49-2-6.7-2.3-9.4-2.3-24.5.1-16.6.1-17.2 3.4-26.7 8.5-24.8 26.1-40.4 50.7-44.8 7-1.3 24.9-.4 31.4 1.6m192-32.1c-17 4.1-35.5 17.9-44 32.8l-3 5.2V196h-37v198h38.9l.4-60.3c.3-67 .1-64.6 7.5-79.7 7.3-14.9 21.9-25.6 38.2-28.1 7-1.1 20.6-.7 25.8.7l2.2.6v-17.5c0-17.3 0-17.5-2.2-18.1-4-1-21.1-.5-26.8.9m-627 4.2c0 .5 14.7 45 32.7 99l32.8 98.3h40.4l12.5-38.3c6.8-21 17.8-54.6 24.3-74.6 6.5-20.1 12.3-36.6 12.8-36.8.6-.1 12 33.5 25.5 74.7l24.5 75 20.4-.3 20.3-.2 32.4-97.9c17.8-53.8 32.4-98.3 32.4-98.7 0-.5-9-.9-20-.9s-20 .3-20 .6c0 .9-44 149.8-44.9 151.9-.7 1.6-1.7-.8-5-11-2.2-7.2-13.3-41.8-24.4-77l-20.4-64-20.5-.3-20.4-.2-23.8 76.2c-13.1 42-24.1 76.6-24.4 77-.4.4-9.9-30.5-21.1-68.5-11.3-38.1-21.5-72.7-22.8-77l-2.4-7.7h-20.4c-11.3 0-20.5.3-20.5.7m759 48.5c-22.7 27-41.3 49.7-41.4 50.4-.1 1.3 80 97.3 81.8 98 .6.2 11.2.3 23.5.2l22.4-.3-40.3-48c-22.1-26.4-40.5-48.5-40.7-49.2-.3-.7 18-23.2 40.6-50.2 22.6-26.9 41.1-49.2 41.1-49.5 0-.4-10.3-.6-22.9-.6h-22.9z"/><path fill="#004080" fillOpacity=".7" d="M1237.4 164.5c0 17 .2 24.2.3 15.8.2-8.3.2-22.3 0-31-.1-8.7-.3-1.9-.3 15.2m-362.1 26.2c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m12 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m185.5 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m13.5 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m627 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m13.5 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m214.5 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m11 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-1056 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m1205.1 7.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-53 6c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m48 0c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-242 2c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2M814 208c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m18.4.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m101.6 2.3c1.9 1.9 3.6 3.5 3.9 3.5s-1-1.6-2.9-3.5-3.6-3.5-3.9-3.5 1 1.6 2.9 3.5m1157.4.7c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m48 0c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-995.9.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m506.9 2.2c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-827 3-1.9 2.3 2.3-1.9c1.2-1.1 2.2-2.1 2.2-2.3 0-.8-.8-.2-2.6 1.9m1070-1c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m241 1c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-49 1c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-286.4 3.3c1.9 1.9 3.6 3.5 3.9 3.5s-1-1.6-2.9-3.5-3.6-3.5-3.9-3.5 1 1.6 2.9 3.5m-647.5-1.5c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-73.7.7c1.2.2 3.2.2 4.5 0 1.2-.2.2-.4-2.3-.4s-3.5.2-2.2.4m1051.6 2.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-1248.1.5c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m851 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m348.1.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-149.1 2.5c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-294.9 1.5c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m487.5 1.5c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m-48.5.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8M899.5 232c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m216 0c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-277.1 2.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m1232 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-1032 1c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-134.9.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m775.9.2c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m439 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-355.4 1.2c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-930.6 2.8c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m1233 2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-1083 1c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m739.1.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m290.9 4.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-5 6c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-49 1c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m44 5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-49 1c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-5 6c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-53 6c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-53 6c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m48 0c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-1265.3 5.4c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m1211.8 1.1c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3m48.5-.5c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-5 6c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-244.1 3.8c0 2.5.2 3.5.4 2.2.2-1.2.2-3.2 0-4.5-.2-1.2-.4-.2-.4 2.3m195.1-2.8c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-1.9 4.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-234.5 4c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m239.5 2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m49 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-43 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m48 0c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-43 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-911 5c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m916 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-911 3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-116 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m102.9 1.2-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2m18.1 1.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m616.9.2c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m343.1-.2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-720.2.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m671.2.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-933.6 1.7c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m27.6 1.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m606.9 1.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-723.9.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m1077 0c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-955 2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m82 2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m878 2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-875 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m559.9 2.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-541.6 3.5c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m-169.5 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m983.2.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-1002.2.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m10.5 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m629 0c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m8 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m74.7 3.5-4 4.3 4.3-4c2.3-2.1 4.2-4 4.2-4.2 0-.8-.9 0-4.5 3.9m-638.6-1.5c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m923.6 3.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-930.6 3.7c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m-141.4 1.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m1126 0c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-49 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m54 5c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-1359.7 6.7c5.7.2 14.7.2 20 0 5.3-.1.7-.3-10.3-.3s-15.4.2-9.7.3m1328 0c6.7.2 17.7.2 24.5 0 6.7-.1 1.2-.3-12.3-.3s-19 .2-12.2.3m-874.5 2c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m8 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m14 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m438 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m38 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-670 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m641 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m20 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7"/></svg>
);

const ProcessingPaymentScreen = ({ onCompletion }: { onCompletion: () => void }) => {
  const [step, setStep] = useState(1); // 1: Verifying, 2: Processing, 3: Confirming

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStep(2), 1200));
    timers.push(setTimeout(() => setStep(3), 2700));
    timers.push(setTimeout(onCompletion, 3500));

    return () => timers.forEach(clearTimeout);
  }, [onCompletion]);

  const Step = ({ n, label, currentStep }: { n: number; label: string; currentStep: number }) => {
    const isActive = n === currentStep;
    const isCompleted = n < currentStep;

    return (
      <div className="flex items-center gap-4">
        <div className="relative h-6 w-6 flex items-center justify-center">
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-blue-500" />
          ) : isActive ? (
            <>
              <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="absolute h-3 w-3 rounded-full bg-white"></div>
            </>
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-gray-300"></div>
          )}
        </div>
        <span className={cn(
            "font-semibold text-base", 
            isCompleted ? "text-gray-900" : "text-gray-400", 
            isActive && "text-gray-900")
        }>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col min-h-screen w-full max-w-md mx-auto bg-gray-50">
      <header className="p-4 text-center border-b bg-white">
        <h1 className="font-bold text-lg">Processing Payment</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
        <div className="relative w-24 h-24">
          <Loader2 className="w-full h-full text-blue-500 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Processing Your Payment</h2>
          <p className="text-gray-500">Please wait while we process your transaction</p>
        </div>

        <Card className="w-full text-left rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h3 className="font-bold">Processing Steps</h3>
            <Step n={1} label="Card details verified" currentStep={step} />
            <Step n={2} label="Processing payment" currentStep={step} />
            <Step n={3} label="Confirmation" currentStep={step} />
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-blue-500">Secure Transaction</span>
          <p className="text-xs text-center">Your payment is protected by bank-level encryption</p>
        </div>
      </main>

      <footer className="p-4 bg-white border-t text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-semibold">
           <div className="flex gap-1">
             <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0s'}}></span>
             <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s'}}></span>
             <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s'}}></span>
           </div>
          Processing payment...
        </div>
      </footer>
    </div>
  );
};


function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const total = searchParams.get('total');
    const totalAmount = total ? parseFloat(total) : 0;
    
    const handlePayNow = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
    };

    const handlePaymentComplete = () => {
        router.push('/mobile/menu/payment-successful');
    };

    if (isProcessing) {
        return <ProcessingPaymentScreen onCompletion={handlePaymentComplete} />;
    }

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-gray-50">
            <header className="p-6 text-center border-b bg-white">
                <NetworkLogo />
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200">
                            <ShieldCheck className="h-6 w-6 text-blue-600"/>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Network International</p>
                            <p className="text-sm text-gray-500">Secure payment gateway</p>
                        </div>
                    </CardContent>
                    <div className="border-t border-dashed" />
                    <CardContent className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Total Amount</span>
                        <span className="font-bold text-lg text-gray-800 font-mono">AED {totalAmount.toFixed(2)}</span>
                    </CardContent>
                </Card>

                <form onSubmit={handlePayNow}>
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 space-y-4">
                            <h3 className="font-bold text-gray-800">Card Information</h3>
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <div className="relative" suppressHydrationWarning>
                                    <Input id="card-number" defaultValue={isMounted ? "4242 4242 4242 4242" : ""} placeholder="1234 5678 9012 3456" className="h-12 rounded-lg bg-gray-100 border-gray-200 pr-20" />
                                    {isMounted && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                          <VisaIcon />
                                          <MastercardIcon />
                                      </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <Input id="expiry-date" defaultValue={isMounted ? "12/26" : ""} placeholder="MM/YY" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input id="cvv" defaultValue={isMounted ? "123" : ""} placeholder="123" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                                <Input id="cardholder-name" defaultValue={isMounted ? "John Smith" : ""} placeholder="John Smith" className="h-12 rounded-lg bg-gray-100 border-gray-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm mt-4">
                        <CardContent className="p-4 space-y-4">
                            <h3 className="font-bold text-gray-800">Billing Address</h3>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue={isMounted ? "john@example.com" : ""} placeholder="john@example.com" className="h-12 rounded-lg bg-gray-100 border-gray-200"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Select defaultValue="uae">
                                    <SelectTrigger id="country" className="h-12 rounded-lg bg-gray-100 border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="uae">United Arab Emirates</SelectItem>
                                        <SelectItem value="us">United States</SelectItem>
                                        <SelectItem value="uk">United Kingdom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-green-50 rounded-2xl border border-green-200 flex items-center gap-3 mt-4">
                        <ShieldCheck className="h-5 w-5 text-green-600"/>
                        <div>
                            <p className="font-bold text-sm text-green-800">Secure Payment</p>
                            <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
                        </div>
                    </div>

                    <footer className="sticky bottom-0 py-4 bg-gray-50/80 backdrop-blur-sm">
                        <Button 
                            className="w-full h-14 rounded-2xl text-lg font-bold bg-[#0069B1] hover:bg-[#005a99]"
                            type="submit"
                        >
                            Pay AED {totalAmount.toFixed(2)}
                        </Button>
                    </footer>
                </form>
            </main>

        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
