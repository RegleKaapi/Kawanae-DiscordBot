export const LibEvent = {
    name: "rolesystem",
    type: "messageCreate",
    ignore: false,
    run: async (message, client) => {
        if (!message || message.author?.bot || !message.guild) return;

        try {
            if (!client.db?.data?.users) return;

            const user = client.db.data.users[message.author.id];
            if (!user) return;

            const level = user.level || 0;

            const role = (level <= 2) ? 'Newbie ㋡'
                : (level <= 4) ? 'Beginner Grade 1 ⚊¹'
                : (level <= 6) ? 'Beginner Grade 2 ⚊²'
                : (level <= 8) ? 'Beginner Grade 3 ⚊³'
                : (level <= 10) ? 'Beginner Grade 4 ⚊⁴'
                : (level <= 20) ? 'Private Grade 1 ⚌¹'
                : (level <= 30) ? 'Private Grade 2 ⚌²'
                : (level <= 40) ? 'Private Grade 3 ⚌³'
                : (level <= 50) ? 'Private Grade 4 ⚌⁴'
                : (level <= 60) ? 'Private Grade 5 ⚌⁵'
                : (level <= 70) ? 'Corporal Grade 1 ☰¹' 
                : (level <= 80) ? 'Corporal Grade 2 ☰²' 
                : (level <= 90) ? 'Corporal Grade 3 ☰³' 
                : (level <= 100) ? 'Corporal Grade 4 ☰⁴' 
                : (level <= 110) ? 'Corporal Grade 5 ☰⁵'
                : (level <= 120) ? 'Sergeant Grade 1 ≣¹'
                : (level <= 130) ? 'Sergeant Grade 2 ≣²'
                : (level <= 140) ? 'Sergeant Grade 3 ≣³'
                : (level <= 150) ? 'Sergeant Grade 4 ≣⁴'
                : (level <= 160) ? 'Sergeant Grade 5 ≣⁵' 
                : (level <= 170) ? 'Staff Grade 1 ﹀¹' 
                : (level <= 180) ? 'Staff Grade 2 ﹀²' 
                : (level <= 190) ? 'Staff Grade 3 ﹀³' 
                : (level <= 200) ? 'Staff Grade 4 ﹀⁴' 
                : (level <= 210) ? 'Staff Grade 5 ﹀⁵' 
                : (level <= 220) ? 'Sergeant Grade 1 ︾¹'
                : (level <= 230) ? 'Sergeant Grade 2 ︾²'
                : (level <= 240) ? 'Sergeant Grade 3 ︾³'
                : (level <= 250) ? 'Sergeant Grade 4 ︾⁴'
                : (level <= 260) ? 'Sergeant Grade 5 ︾⁵'
                : (level <= 270) ? '2nd Lt. Grade 1 ♢¹'
                : (level <= 280) ? '2nd Lt. Grade 2 ♢²'  
                : (level <= 290) ? '2nd Lt. Grade 3 ♢³' 
                : (level <= 300) ? '2nd Lt. Grade 4 ♢⁴' 
                : (level <= 310) ? '2nd Lt. Grade 5 ♢⁵'
                : (level <= 320) ? '1st Lt. Grade 1 ♢♢¹'
                : (level <= 330) ? '1st Lt. Grade 2 ♢♢²'
                : (level <= 340) ? '1st Lt. Grade 3 ♢♢³'
                : (level <= 350) ? '1st Lt. Grade 4 ♢♢⁴'
                : (level <= 360) ? '1st Lt. Grade 5 ♢♢⁵'
                : (level <= 370) ? 'Major Grade 1 ✷¹'
                : (level <= 380) ? 'Major Grade 2 ✷²'
                : (level <= 390) ? 'Major Grade 3 ✷³'
                : (level <= 400) ? 'Major Grade 4 ✷⁴'
                : (level <= 410) ? 'Major Grade 5 ✷⁵'
                : (level <= 420) ? 'Colonel Grade 1 ✷✷¹'
                : (level <= 430) ? 'Colonel Grade 2 ✷✷²'
                : (level <= 440) ? 'Colonel Grade 3 ✷✷³'
                : (level <= 450) ? 'Colonel Grade 4 ✷✷⁴'
                : (level <= 460) ? 'Colonel Grade 5 ✷✷⁵'
                : (level <= 470) ? 'Brigadier Early ✰'
                : (level <= 480) ? 'Brigadier Silver ✩'
                : (level <= 490) ? 'Brigadier Gold ✯' 
                : (level <= 500) ? 'Brigadier Platinum ✬'
                : (level <= 600) ? 'Brigadier Diamond ✪'
                : (level <= 700) ? 'Legendary 忍'
                : (level <= 800) ? 'Legendary 忍忍'
                : (level <= 900) ? 'Legendary 忍忍忍'
                : (level <= 1000) ? 'Legendary 忍忍忍忍'
                : 'Master × Legendary';

            user.role = role;

        } catch (error) {
            console.error('[Role System Error]:', error);
        }
    }
};