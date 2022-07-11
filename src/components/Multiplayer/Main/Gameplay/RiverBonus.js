export function RiverBonus(oldSelectionName, attackedSelection){

   const daugavaRiverRus = ["Riga", "Aizkraukle", "Jekabpils", "Daugavpils", "Kraslava", "Moiry", "Verkhnyadzvinsk",
      "Navapolatsk", "Sumilna", "Haradok", "Shukhova", "Kubanikha"]
   const daugavaRiverGer = ["Jurmala", "Jelgava", "Akniste", "Silene", "Pastavy", "Vileyka", "Sharkaushchyna", "Lepiel", "Vitebsk",
    "Berezino", "Demidov", "Padory", "Ruchyevaya Mal"]
   const dniperRiverRus = ["Chojniki","Chernobyl", "Boryspil", "Pereyaslav-Khmelnytskyi", "Shramkivka", "Lazirky",
      "Lubny", "Myrhorod", "Poltava", "Mahdalynivka", "Synelnykove", "Zaporozhe", "Enerhodor",
      "Nova Kakhovka", "Kherson"]
   const dniperRiverGer = ["Shyroka Balka", "Bilozerka", "Dar'ivka", "Nikopol", 
   "Hoholivka", "Dnipro", "Saporischja", "Kobelyaky", "Kremenchuk", "Bohodukhivka",
   "Zolotonosha", "Helmyaziv", "Myronivka", "Kiev", "Ivankiv", "Zelena Polyana"]
   const volkhovRiverRus = ["Syasstory", "Kirishi", "Pchevzha", "Kresttsy", "Lychkovo"]
   const volkhovRiverGer = ["Novaya Ladoga", "Volkhov","Lyuban", "Borisovo", "Staraya Russa"]
   const svirRiverRus = ["Voznessenye", "Podporozye", "Lodejnoje Polje"]
   const svirRiverGer = ["Kuytezha", "Ladva-Vetka", "Ladva", "Shyoltozero"]
   const donRiverRus = ["Azov", "Bataysk", "Gigant", "Salsk", "Grekov", "Krasnoyarovka", "Sarinovka",
      "Sukhanov", "Mukovnin", "Kumylzhenskaya", "Nizh Rakovka", "Mikhaylovka", "Uryupinsk",
      "Loshchinovskiy", "Buturlinovka", "Talovaya", "Ramonye", "Lomigory", "Usman", "Gryazi",
      "Chaplygin", "Shelemishevo", "Erlino", "Karandeevka"]
   const donRiverGer = ["Rostov", "Yulovskiy", "Sergeevka", "Spartak", "Komsomolskiy", "Zakharov",
      "Konovalovskiy", "Kuchurovskiy", "Novoanninsky", "Pavlovskiy", "Kalach", "Verkhniy Mamon",
      "Pavlovsk", "Bobrov", "Novovoronezh", "Voronezh", "Zadonsk", "Lipetsk", "Lev Tolstoy",
      "Bogoroditskoye", "Zhmurovo"]
   const volgaRiverRus = ["Sizyy Bugor", "Seitovka", "Seroglazka", "Bolkhuny", "Novonikolaevka",
      "Akhtubinsk", "Znamensk", "Leninsk", "Volzhskiy", "Debovka", "Ilovlya", "Kuptsovo", "Kamyshin",
      "Krasny Kut", "Engels", "Stepnoje"]
   const volgaRiverGer = ["Kamyzyak", "Astrakhan", "Kosika", "Enotaevka", "Zubovka", "Stasov",
      "Shelestovo", "Stalingrad", "Kalach-na-Donu", "Kashulin", "Avilovo", "Lapshinskaya", "Nekrasovo",
      "Saratow", "Saburovka"]

   //Daugava river
   for(let i = 0; i<daugavaRiverRus.length; i++){
      if (attackedSelection === daugavaRiverRus[i]){
         
         for(let j = 0; j<daugavaRiverGer.length; j++){
            if(oldSelectionName === daugavaRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<daugavaRiverGer.length; i++){
      if (attackedSelection === daugavaRiverGer[i]){
         for(let j = 0; i<daugavaRiverRus.length; j++){
            if(oldSelectionName === daugavaRiverRus[j]){
               return 2
            }
         }
      }
   }
   //Dniper river
   for(let i = 0; i<dniperRiverRus.length; i++){
      if (attackedSelection === dniperRiverRus[i]){
         for(let j = 0; j<dniperRiverGer.length; j++){
            if(oldSelectionName === dniperRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<dniperRiverGer.length; i++){
      if (attackedSelection === dniperRiverGer[i]){
         for(let j = 0; j<dniperRiverRus.length; j++){
            if(oldSelectionName === dniperRiverRus[j]){
               return 2
            }
         }
      }
   }
   //Volkhov river
   for(let i = 0; i<volkhovRiverRus.length; i++){
      console.log("1")
      if (attackedSelection === volkhovRiverRus[i]){
         for(let j = 0; j<volkhovRiverGer.length; j++){
            console.log("2")
            if(oldSelectionName === volkhovRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<volkhovRiverGer.length; i++){
      console.log("3")
      if (attackedSelection === volkhovRiverGer[i]){
         for(let j = 0; j<volkhovRiverRus.length; j++){
            console.log("4")
            if(oldSelectionName === volkhovRiverRus[j]){
               return 2
            }
         }
      }
   }
   //svir river
   for(let i = 0; i<svirRiverRus.length; i++){
      if (attackedSelection === svirRiverRus[i]){
         for(let j = 0; j<svirRiverGer.length; j++){
            if(oldSelectionName === svirRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<svirRiverGer.length; i++){
      if (attackedSelection === svirRiverGer[i]){
         for(let j = 0; j<svirRiverRus.length; j++){
            if(oldSelectionName === svirRiverRus[j]){
               return 2
            }
         }
      }
   }
   //don river
   for(let i = 0; i<donRiverRus.length; i++){
      if (attackedSelection === donRiverRus[i]){
         for(let j = 0; j<donRiverGer.length; j++){
            if(oldSelectionName === donRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<donRiverGer.length; i++){
      if (attackedSelection === donRiverGer[i]){
         for(let j = 0; j<donRiverRus.length; j++){
            if(oldSelectionName === donRiverRus[j]){
               return 2
            }
         }
      }
   }
   //volga river
   for(let i = 0; i<volgaRiverRus.length; i++){
      if (attackedSelection === volgaRiverRus[i]){
         for(let j = 0; i<volgaRiverGer.length; j++){
            if(oldSelectionName === volgaRiverGer[j]){
               return 2
            }
         }
      }
   }
   for(let i = 0; i<volgaRiverGer.length; i++){
      if (attackedSelection === volgaRiverGer[i]){
         for(let j = 0; j<volgaRiverRus.length; j++){
            if(oldSelectionName === volgaRiverRus[j]){
               return 2
            }
         }
      }
   }
   return 1
}