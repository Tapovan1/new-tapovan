import 'dotenv/config';
import {  TeacherRole, Status } from '../lib/generated/prisma/client';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';


async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all teachers (using 'password123' as default)
  const hashedPassword = bcrypt.hashSync("tapovan@1234",10)

  // Seed Teachers
  console.log('📚 Seeding Teachers...');

  const teachers = [
//     {
//     username: "kaminiben",
//     password: "$2b$10$J.ByqNIfDr6GTJA6BojDyuW2rEgEQjzfrTjkeLxGPFcxEojqjrg0e",
//     name: "SUTHAR KAMINIBEN VINAYKUMAR",
//     email: "kaminiben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhaktiben",
//     password: "$2b$10$PuP2.h9t7w4KSDXz9LjkteXHPA01D2uS4/jPz5COBEpH38ubIgOPi",
//     name: "PATEL BHAKTIBEN TRUSHARKUMAR",
//     email: "bhaktiben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "payalben",
//     password: "$2b$10$E8.snIgHD1GDmCnesGk31uLAFNUsTN3rbtCAQ8qgwqrQgdJ0YtsQu",
//     name: "BRAHMBHATT PAYALBEN ANILKUMAR",
//     email: "payalben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ankitaben",
//     password: "$2b$10$7dMDtGo90rp3ki/lD4T.ee/kQyhAMf6oktn1XGdLGkVI4V0uuD93O",
//     name: "PRAJAPATI ANKITABEN AMITKUMAR",
//     email: "ankitaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "dhirajbhai",
//     password: "$2b$10$CsptEw42h.8TWPCK7Z92k.KnGYfyS680fVx3Lr5yQNL2rUQFYWhea",
//     name: "CHAUDHARY DHIRAJBHAI JOITABHAI",
//     email: "dhirajbhai@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "sudhaben",
//     password: "$2b$10$ws1FpV.YxPd7Ud6ZAxz7YelCrTg7YhK.ZzOwdcdlboQ13eze7i7du",
//     name: "SUTHAR SUDHABEN VINODKUMAR",
//     email: "sudhaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "hiteshkumar",
//     password: "$2b$10$onzbfAF.s9Bywzk9zTqcoe6SdvZUN9P62qSkpGq5Ag/Fhv5E/egZi",
//     name: "SUTHAR HITESHKUMAR AMRUTLAL",
//     email: "hiteshkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "manishaben",
//     password: "$2b$10$4q5YJlMB0DK.SvybyenqnuA9TU9S9zryvPNEwCY3IYbzAQ2xd220y",
//     name: "SUTHAR MANISHABEN KIRTIKUMAR",
//     email: "manishaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhumikaben",
//     password: "$2b$10$bzRldIa9Zi2vjIClEVCSeupOoatnuLdou..vYQZUO.t2ONjtFXnC6",
//     name: "PATEL BHUMIKABEN JATINKUMAR",
//     email: "bhumikaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "samirkumar",
//     password: "$2b$10$1V4Lq30rbXq3OjoP5oT5v.jb4M8HV6AAyrzDQ4In9.LyLDNExd31a",
//     name: "PATEL SAMIRKUMAR MANILAL",
//     email: "samirkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },

//   {
//     username: "hiteshbhai",
//     password: "$2b$10$qigxdIyoZ0wnNSl5yYDihONe6W.Wq5OBBTomzcLTeATGUHtZas4WW",
//     name: "CHENVA HITESHKUMAR RAMESHBHAI",
//     email: "hiteshbhai@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhavikkumar",
//     password: "$2a$10$l51JYLkm8.tLEy728s/uOOLUHTzGHSIL/kvX/0WNGsy5AI2/2RscO",
//     name: "PATEL BHAVIKKUMAR POPATBHAI",
//     email: "bhavikkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "jalpaben",
//     password: "$2b$10$Heu8qYvbNvDwVUorDeCdHuH.93zZaxSKtAgIiAR3qjYJrHhkTXLwO",
//     name: "PATEL JALPABEN PIYUSHBHAI",
//     email: "jalpaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "montukumar",
//     password: "$2b$10$eL64hUP264n18UDRFjSee.5b2pd36a598QQU2jJ6vs/o/mWwsj9ZK",
//     name: "NAI MONTUKUMAR MANUBHAI",
//     email: "montukumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "purviben",
//     password: "$2b$10$J4Tx0X5.XeMZJsLKfwTNPOMrnP0A8FiuQr/SiLlV7yqBLRSYyL4AO",
//     name: "GANDHI PURVIBEN UDAYKUMAR",
//     email: "purviben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "kalpanaben",
//     password: "$2b$10$nnEOHJ.yAXJLLiVN76bMjueTHgQXmIrIxsjjYxScuCmww6Ieu6jJC",
//     name: "PATEL KALPANABEN UTKARSHKUMAR",
//     email: "kalpanaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "phardik667",
//     password: "$2b$10$2SpbZypQ3GrRku7Ld6BUP.fE8AF9zjpbgdn70L./vUAJXNWG0TUBW",
//     name: "PANCHAL HARDIKKUMAR MANOJKUMAR",
//     email: "phardik667@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "meet",
//     password: "$2b$10$LkgAIWvtoI1.jr1gFwt5G.yIAktzjBr/zfg4HQ8A1DwmvtjY8Q/dS",
//     name: "BHAVSAR MEET DIVYKANTBHAI",
//     email: "meet@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "paresh",
//     password: "$2b$10$HzZzfaJD38BOinrcZ9qiPOeEDdnF5yOMqX1BFi/m75/Xpb/tFkG/C",
//     name: "PATEL PARESHKUMAR SURESHBHAI",
//     email: "paresh@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "jignesh",
//     password: "$2b$10$dp7Tui0JIedaIbYa3Cl3d.AofFWsu1Pc2/Iz9XwJ9eQAS8QlzeKfu",
//     name: "SOLANKI JIGNESH ARVINDBHAI",
//     email: "jignesh@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "tejaskumar",
//     password: "$2b$10$0nPCqp.bkiTau5txpBsg1e2LDOl1XjvKGaq.dyKj3Vd7/TkRVrssG",
//     name: "PRAJAPATI TEJASBHAI JIVANBHAI",
//     email: "tejaskumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "nishantkumar",
//     password: "$2b$10$vgPEV8GQPBwoDo8ipqSLeOnVux8.7REu5HaOQxDaWRgwfQ5tPK1KK",
//     name: "PATEL NISHANTBHAI MUKESHBHAI",
//     email: "nishantkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "vipulkumar",
//     password: "$2b$10$zTWEPUzxzZCdtB9FawG5WOzZ37q0eRY50JDCttWuDPNMH0lRWXyfa",
//     name: "PATEL VIPULKUMAR MOHANBHAI",
//     email: "vipulkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ramanbhai",
//     password: "$2b$10$DokzakWdKd2Zp6brxjyx8.5C46zjaZIsRFsxvabqzSwWPEVrl/Dxm",
//     name: "PARMAR RAMANBHAI DHULABHAI",
//     email: "ramanbhai@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "sahil",
//     password: "$2a$10$l51JYLkm8.tLEy728s/uOOLUHTzGHSIL/kvX/0WNGsy5AI2/2RscO",
//     name: "RAVAL SAHILBHAI DILIPKUMAR",
//     email: "sahil@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "kalpeshkumar",
//     password: "$2b$10$Hs9bzyRc0obCh3FgFPLPAOBH3dhddSZp6wEmfqAR7GKQb3Cg9nEDq",
//     name: "PATEL KALPESHKUMAR ISHVARBHAI",
//     email: "kalpeshkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "kevalkumar",
//     password: "$2b$10$R98PNVntIW8bQxzayC6WLu6gU57smy71SrwoLSEjmEhuLvizoEUaG",
//     name: "PATEL KEVALKUMAR MAHENDRABHAI",
//     email: "kevalkumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bindu",
//     password: "$2b$10$bM3upRwuVkzRIhY8wRA62OEYw0mfk3UrKGETJrJo0MtCcwPmgoEOi",
//     name: "PRAJAPATI BINDUBEN K",
//     email: "bindu@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "vruttaben",
//     password: "$2b$10$JcMMBj4CUt.TitPZIsFUR.p0Shuf.bDdfTbHT2NsO6scjF9ltZpWu",
//     name: "PATEL VRUTTABEN JASAVANTKUMAR",
//     email: "vruttaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "swetal",
//     password: "$2b$10$PDxUg1ZrI3KfQb.AxLaRT.FoWjcW6p.fNakCGJtrVPf2nbwyDU.9G",
//     name: "SHAH SWETAL BHARATKUMAR",
//     email: "swetal@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },

//   {
//     username: "vaishnav",
//     password: "$2b$10$I.MoGL4MxZ2bpnrXHd7AnOYeXRT1pw0KhixYUvC9JYRT0NtSY3EYq",
//     name: "VAISHNAV CHAITANYA",
//     email: "vaishnav@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "rutvik",
//     password: "$2b$10$fTRCLtKcQcOBKNB/CExngemiWoIR3172hdG.9NqljhgUcQ4TG2mTS",
//     name: "RAVAL RUTVIK PRAHLADBHAI",
//     email: "rutvik@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "jyotikaben",
//     password: "$2b$10$JPoAMNR6MpLJSsavVVPQBeraA8qOcIGPYQMhwSjIdOECWymrHEK5K",
//     name: "CHAUHAN JYOTIKABEN PRAKASHBHAI",
//     email: "jyotikaben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "dilip",
//     password: "$2b$10$2KpgWnlIAwiMLNAVCbuNBur4GvVBjwf6yxNShs/rNbs9SWWHvFYoa",
//     name: "MAKWANA DILIPSINH NATHUSINH",
//     email: "dilip@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "tothepoint.gujarat",
//     password: "$2b$10$ZNhdALzK9hRIDx5M3E7ymuDImM6aHyD7YqSN/L8d/QGr4MaLueCz2",
//     name: "PANCHAL HITESH A",
//     email: "tothepoint.gujarat@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "neel",
//     password: "$2b$10$N7wY0Ba3xUEbWvaaS3ijm.2Ifa31mOXbYPu70unIfyC6XlC.KRZCm",
//     name: "PATEL NIL JAYESHBHAI",
//     email: "neel@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "jigna",
//     password: "$2b$10$iCPPgF.lsC7Meb86qPQGpODCiEanL8XhZABcb8kuKuxsmR8gVNg4O",
//     name: "PATEL JIGNABEN DHIMANTKUMAR",
//     email: "jigna@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "rita",
//     password: "$2b$10$UXcSfzmk5yLUkpknspsxdOLCukfZcbSMD0rIcPRpvx23Zpmb7msRO",
//     name: "RAVAL RITABEN CHETANKUMAR",
//     email: "rita@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "shitalben",
//     password: "$2b$10$kcV6tkvgekncbY6fs41/..mXjmKhIQGes9NvM48Icgr1VLiAKo9je",
//     name: "GOVANI SHITAL MAHESHBHAI",
//     email: "shitalben@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "viveka",
//     password: "$2b$10$zNtY5r28CMrmk55eytl13.LUeYiwuLWPvbGK9P587Cmq5klmSC4eC",
//     name: "SONI VIVEKABEN",
//     email: "viveka@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//    {
//     username: "anil",
//     password: "$2b$10$g/hTsh.kzeeE6uJsKXmgfeCDVWNY/sweqbGExWt43FsMwGGuvnD.e",
//     name: "PRAJAPATI ANILBHAI KACHRABHAI",
//     email: "anil@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "nishant",
//     password: "$2b$10$X8bBXU2.mz/I1rx82X6wa.wrpY0ujtHfP4AtyifajeI2duAfocwby",
//     name: "PATEL NISHANT SATISHCHANDRA",
//     email: "nishant@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "sunil",
//     password: "$2b$10$rMKYzJqqZp.5Ev/gKax7nOmWnTIcSl42LFEXAkM9j7lnpil7AaZbW",
//     name: "NAI SUNILKUMAR RANACHHODBHAI",
//     email: "sunil@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhavin",
//     password: "$2b$10$nI97RpwB6qBO9GUNAY8P8OftCI6M6wU/i007FhuIU.0tJy1kno58m",
//     name: "PATEL BHAVINKUMAR SURESHBHAI",
//     email: "bhavin@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "pravin",
//     password: "$2b$10$/WYpgYshiiDwpmzKJemn2.rpB3DQlyWZ1WsaCCY2fYQMmhpfweW9K",
//     name: "PATEL PRAVINKUMAR BABUBHAI",
//     email: "pravin@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bharat",
//     password: "$2b$10$IicHXC70BiS.8x3kpJtwJeoMO0JLgmfhDlepYCQnC8DVji97P8ia6",
//     name: "PARMAR BHARATBHAI CHHAGANBHAI",
//     email: "bharat@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "darshn",
//     password: "$2b$10$GaqqhkGZzMq9eANyWaReKuw3wuEScQ/b.ueSm94Ob4LF/9Qp4.qwi",
//     name: "PRAJAPATI DARSHANBHAI",
//     email: "darshn@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "payalbenpatel",
//     password: "$2b$10$2/cBjndzzI1dcR.9r0RyPujIbdmZxCPJLzov0T0Eykvnneh4O50iS",
//     name: "PATEL PAYALBEN DIPAKKUMAR",
//     email: "payalbenpatel@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "sachin",
//     password: "$2b$10$fmU0LaJ7Fr/MZyGM9XVJcuKQr5VKpwnpybqj/e/df/BFWSMR7MQVe",
//     name: "PATEL SACHIN PRAVINBHAI",
//     email: "sachin@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "disha",
//     password: "$2b$10$fGJEyZdoxSSW7jyu.LipoOtpzzpctTgoZyK0MzOqmLytjJ84QiSWu",
//     name: "PRAJAPATI DISHABEN KRIYANKUMAR",
//     email: "disha@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },

//   {
//     username: "viral",
//     password: "$2b$10$7mIG3FvaDg/XXh6klsJDGurVfzSFuX.Bv3yGnqGdfTAiO8LwfLxxS",
//     name: "CHAUDHARY VIRALKUMAR RAGHJIBHAI",
//     email: "viral@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "niru",
//     password: "$2b$10$GM7j86Jp2sQ9XXIqh9Jz9O1rtxVuWoqsrV0mJPk3IKUrOjhDSApku",
//     name: "CHAMAR NIRUBEN ARVINDBHAI",
//     email: "niru@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "nimisha",
//     password: "$2b$10$.Ic8Jb7YjVonI9r7.oYH4.SnaWmBGQu9IGSKj8A1TFGVqqfPXruNW",
//     name: "PATEL NIMISHABEN VISHANUBHAI",
//     email: "nimisha@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "meetpatel",
//     password: "$2b$10$LvU2.0tT/5v2CHR8rpq41.clU7nmcmr92dwTlwSCnlpYt9bWxnqum",
//     name: "PATEL MEET DEVENDRAKUMAR",
//     email: "meetpatel@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "mitesh",
//     password: "$2b$10$e5lad2W6HpWoSBCVO0CzRucc0Tmv0ARGVvarIQPZII5SmXCK9F6Im",
//     name: "LEUVA MITESHBHAI BABUBHAI",
//     email: "mitesh@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "hemangi",
//     password: "$2b$10$pJ40FMbyu8WH4inZlVu5GeQlcmfkVkw0EFS/lfXYAEyGyBPhmmH3y",
//     name: "PATEL HEMANGIBEN UPENDRAKUMAR",
//     email: "hemangi@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "rinkal",
//     password: "$2b$10$b9vwY2.2l/vzIvc49QVTG.CCEiIW6YR3D6E9dsFDyRAuoje0hGdOO",
//     name: "PATEL RINKALBEN GAURAVKUMAR",
//     email: "rinkal@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "yami",
//     password: "$2b$10$o6Z1bgJc1J.EKUENcTvC0.3cIbOcyL8fkpAJIKA3P3RCsuSJE4gpi",
//     name: "PATEL YAMIBEN RUSHIKKUMAR",
//     email: "yami@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ankita",
//     password: "$2b$10$j8YOyEMS/b64qHRRqwdKMe9PZdp6W1crkJeec266FZWtq5k24dkby",
//     name: "SUTHAR ANKITABEN ANKITKUMAR",
//     email: "ankita@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ankitam",
//     password: "$2b$10$4YElR2SZqIYaTi2w9Kj1xODols71JAFPv63qKDIwLb28AX6sVHfTm",
//     name: "PRAJAPATI ANKITA MEHULKUMAR",
//     email: "ankitam@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhoomika",
//     password: "$2b$10$BuUzSwKUpSt7FZRa3HgKUeEPVFUcBdENYzpHJWAqGdWa0ejj1pOtq",
//     name: "RAVAL BHOOMIKABEN RASIKBHAI",
//     email: "bhoomika@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "rashmi",
//     password: "$2b$10$KRoF2is9wcY9CSR.T6YuPuOelig1b7VGnK1vR7be0zlghRmzOcr/2",
//     name: "PANDYA RASHMIKANT DEVENDRAPRASAD",
//     email: "rashmi@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "sani",
//     password: "$2b$10$tAnTtllGpsYaH0b9cSOtY.fJ8OvBbOy/NdstQtpzY28y/x//i29P6",
//     name: "PATEL SANI ASHVINBHAI",
//     email: "sani@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "prakash",
//     password: "$2b$10$zoajiQYnF5HNMoGxvKJWQuu45G/Mcy/7KhKSMuHFvNVZ3NqHsP7lC",
//     name: "PANCHAL PRAKASHBHAI VINODBHAI",
//     email: "prakash@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ravikumar",
//     password: "$2b$10$RqifbtiqnHZSqO8WkDLGC.IOdJgomIGNBXibTunrw5beM6Jfz9ccO",
//     name: "PATEL RAVIKUMAR JITENDRABHAI",
//     email: "ravikumar@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhargav",
//     password: "$2b$10$6BZFAp.PyB70/A6UG3Ms8.4UYtM1UKdqKiDzvupM7Nkq0e7ZV4au6",
//     name: "SUTHAR BHARGAVKUMAR CHANDUBHAI",
//     email: "bhargav@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "kirti",
//     password: "$2b$10$Ifj176YLwldSdD0T7s8fBe1ITKB8eoRurmUAKWtsDrJJ66GN/3U/O",
//     name: "PATEL KIRTIBEN SHAILESHBHAI",
//     email: "kirti@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bharat2025",
//     password: "$2b$10$yk7znu1XNPFELrqWMzBrS.lWmQct29swKQ3X8aNpNHY670kkcDS66",
//     name: "VANKAR BHARATKUMAR BABULAL",
//     email: "bharat2025@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "divya",
//     password: "$2b$10$MliqYeI1pJvQ9X43wvbgOuQSSubg/vfWJUpKoe9XktN4Ty4VnPiQG",
//     name: "PANCHAL DIVYABEN VASANTKUMAR",
//     email: "divya@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhumika",
//     password: "$2b$10$7cRP9QOizvOj0XpDwG1vvu6nSmNi3XVwmw1i/56EyyqHdSkW96flm",
//     name: "PATEL BHUMIKABEN JAYANTILAL",
//     email: "bhumika@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },

//   {
//     username: "shamal",
//     password: "$2b$10$56n0L2zXU7IBeFZ5H/kXeulSlO20xa0Hqi4.2hRDoT9md.6urRQqq",
//     name: "SHAMAL BHAI",
//     email: "shamal@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "bhumika1",
//     password: "$2b$10$yZNx84wf//XLqZfCg2Q1TePdVwNk22wKtNSG8Bz7XVaoHY/FJYYj2",
//     name: "PATEL BHUMIKABEN DINESHBHAI",
//     email: "bhumika1@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "vaidehi",
//     password: "$2b$10$a/FDqX110AdhiPlYNt/vMeSodzE0zGxtpY4iSF0xUF6RPBziWL58a",
//     name: "NAYAK VAIDEHI NITINKUMAR",
//     email: "vaidehi@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "khushee",
//     password: "$2b$10$2ZmG0eNv6kxcS4XdWM6pHOiEbt04DiXaPX7BA5zG2qpV/VRHx283C",
//     name: "PATEL KHUSHEE NARENDRABHAI",
//     email: "khushee@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "smit1",
//     password: "$2b$10$CS3Af32352NyW7XGsJrw5.5y5rjp/kPgh/trofDawG09Nn8uW3eDG",
//     name: "SUTHAR SMIT YOGESHBHAI",
//     email: "smit1@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "dipika",
//     password: "$2b$10$/IjduNLJ2ZcPqMnfP2wNS..LFkwmsr2wElON1qPxpo1j/tMx/MxPC",
//     name: "CHAUHAN DIPIKABEN SANI KUMAR",
//     email: "dipika@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "dipika1",
//     password: "$2b$10$Solq0MbhUF9XLRYksNNDKOF9RyEGzc1npre92e72E6mhpAgTCIuSy",
//     name: "PATEL DIPIKABEN VRAJKUMAR",
//     email: "dipika1@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "shubham",
//     password: "$2b$10$GiZSAzevbzlq5RHxXQoDZ.wKpellWzswAiSnMlhzxsC/cXOel0hTW",
//     name: "GANDHI SHUBHAM HARESHKUMAR",
//     email: "shubham@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "armi",
//     password: "$2b$10$EpnNZ8dNY7oycGylHRccgeLKY4LMkX2BmZH6K14D1k6b.pwMUFMPO",
//     name: "PATEL ARMI NARESHBHAI",
//     email: "armi@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "isha",
//     password: "$2b$10$3dRPIChpZccnfjoFJTnfNeh8qBYKMvhSePhQmHIFHkL34Wqi3fQfO",
//     name: "KHATRI ISHA BIJENDRAKUMAR",
//     email: "isha@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "mayur",
//     password: "$2b$10$YUweqpVTnVoh6chWcm1zgee/NOmRhQ.NqMVLCId7rmKIeF60m3LBW",
//     name: "PATEL MAYURKUMAR GIRISHBHAI",
//     email: "mayur@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "ashok",
//     password: "$2b$10$Z6W177dQ51Gk662rUSmvF.FtdeiT.2Xd6Itbn7mbUkgATE/vwdsoG",
//     name: "RATHOD ASHOKSINH JAGATSINH",
//     email: "ashok@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "jatin",
//     password: "$2b$10$o0u2WUO9NDu5MqC2jWTw8.0pLU40x3GD38FkzD5WaqxXvHPMlMBhS",
//     name: "SPINAR JATIN DHIRAJBHAI",
//     email: "jatin@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
//   {
//     username: "deepvan",
//     password: "$2b$10$Pds82L/SJQqRGrQoKNkdBOcNGqMmZwkELX5YyO2M/97kvnZDLJhcy",
//     name: "GOSWAMI DEEPVAN SURESHVAN",
//     email: "deepvan@gmail.com",
//     role: "TEACHER",
//     status: "ACTIVE"
//   },
  {
    username:"admin1",
    password:"$2b$10$/sESDk8W0Lch5WeelxriI.24EE/N3cmb9sP8tlrx9rv5XDuS6FIG2",
    name:"ADMIN",
    email:"admin1@gmail.com",
    role:"ADMIN",
    status:"ACTIVE"
  }
  ]
//   console.log("deleting all data....");
  
//   //first dlete all data in teacher
//   await prisma.teacher.deleteMany();
//   console.log("✅ Deleted all teachers");
  

 //insert data not upsert because there are no any data  si

  for (const teacher of teachers) {
    await prisma.teacher.create({
      data: {
        username: teacher.username,
        name: teacher.name,
        email: teacher.email,
        password: teacher.password,
        role: TeacherRole.ADMIN,
      }
    });
    console.log(`✅ Created teacher: ${teacher.username} (${teacher.email})`);
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
