<template>
    <v-dialog
        v-model="$store.state.loader"
        hide-overlay
        persistent
        width="300"
    >
        <v-card
            style="padding:10px;opacity: 0.75"
            dark
        >   
            <v-card-text  >
                <span>אנא המתן...</span>   
                <v-progress-linear
                    
                    indeterminate
                    color="white"
                    class="mb-0 mt-3"

                >

                </v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>