<template>
    <v-dialog
        v-model="loaderStore.loader"
        hide-overlay
        persistent
        width="300"
    >
        <v-card color="grey-darken-4" style="padding:10px;opacity: 0.75">   
            <v-card-text  class="text-right">
                <span>אנא המתן...</span>   
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0 mt-4"
                    reverse
                >
                </v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { useLoaderStore } from '@/stores/LoaderStore'
const loaderStore = useLoaderStore()
</script>

<script>
export default {
  name: 'AppLoader',
}
</script>
