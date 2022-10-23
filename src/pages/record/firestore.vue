<script setup lang="ts">
import { Timestamp } from 'firebase/firestore';
import { defaultFirestoreService as firestoreService } from '~/services/firestore.service'
import { ATMUserReport, ATMUserReportKind } from '../../models/atm-user-report'

const reports = ref<{ id: string; data: ATMUserReport }[]>([])

onMounted(async () => {
  // Array.from({ length: 10 }, (_, idx) => idx).forEach(async (id) => {
  //   await firestoreService.addUserReport({
  //     atmID: id,
  //     description: `description: ${id}`,
  //     kind: ATMUserReportKind.OTHER,
  //     upvotes: id,
  //     timestamp: new Date(),
  //   })
  // })

  const snapshot = await firestoreService.getAllReportsForAtm('5202')
  reports.value = snapshot.map((doc) => {
    // console.log(doc.data(), doc.id)
    return {
      id: doc.id,
      data: doc.data(),
    }
  })

  // firestoreService.setOnReportsUpdate(5202, (snapshot) => {
  //   reports.value = snapshot.docs.map((doc) => {
  //     return {
  //       id: doc.id,
  //       data: doc.data(),
  //     }
  //   })
  // })
})

const upvote = async (reportID: string) => {
  await firestoreService.upvoteUserReport(reportID)
}

const downvote = async (reportID: string) => {
  await firestoreService.downvoteUserReport(reportID)
}

const createAlert = async () => {
  await firestoreService.addUserReport({
    atmID: '5202',
    description: 'no hay varo',
    kind: ATMUserReportKind.NO_CASH,
    timestamp: Timestamp.now(),
    upvotes: 2,
  })
}
</script>

<template>
  <div>
    <ul>
      <li v-for="report in reports" :key="report.id">
        Reporte para atm {{ report.data.atmID }}
        <br />
        Descripcion {{ report.data.description }}
        <br />
        Votos: {{ report.data.upvotes }}
        <br />
        <button class="btn" @click="upvote(report.id)">Upvote</button>
        <button class="btn" @click="downvote(report.id)">Downvote</button>
      </li>
    </ul>
  </div>
  <button class="btn" @click="createAlert">Create report</button>
</template>

<style scoped></style>
