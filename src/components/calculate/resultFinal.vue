<script setup>
const video = '/video.mp4'
</script>
<template>
  <div class="wrapper">
    <video :src="video" autoplay muted loop playsinline=""></video>
    <div class="final__head">
      Практические советы для долгой и здоровой жизни
    </div>
    <div class="final__body">
      <div class="final__col">
        <div class="final__item">
          Уменьшайте окружность талии и наращивайте мышечную массу.
        </div>
        <div class="final__item">
          Уменьшайте окружность талии и укрепляйте мышцы
        </div>
        <div class="final__item">
          Придерживайтесь рациона, близкого к средиземноморской диете
        </div>
        <div class="final__item">
          Практикуйте ограниченное по времени питание и интервальное голодание
        </div>

      </div>
      <div class="final__col">
        <div class="final__item">
          Заботьтесь о своих мыслях — укрепляйте и защищайте их от негатива
        </div>
        <div class="final__item">
          Развивайте дружбу, щедрость и сострадание
        </div>
        <div class="final__item">
          Проводите больше времени на природе и свежем воздухе
        </div>
        

      </div>
      <div class="final__col">
        <div class="final__item">
          Будьте активными каждый день
        </div>
        <div class="final__item">
          Откажитесь от курения, в том числе электронных сигарет
        </div>
        <div class="final__item">
          Сведите потребление алкоголя к минимуму
        </div>
        <div class="final__item">
          Сделайте качественный сон своим приоритетом
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: brightness(0.8);
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4.25rem;
  background-color: rgb(29, 29, 29);
}

.final__head {
  color: #FFF;
  color: #FFF;
  font-family: "TT Hoves";
  font-size: 4rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.04rem;
  position: relative;
  width: 55.125rem;
}

.final__body {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 2px;
}

.final__col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.final__item {
  color: #FFF;
  color: #FFF;
  font-family: "TT Hoves";
  font-size: 2.82rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.03rem;
  width: 40.25rem;
  height: 24.61rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.30);
  backdrop-filter: blur(17px);
  flex-shrink: 0;
  padding: 3rem;
  display: flex;
  align-items: center;
}
</style>