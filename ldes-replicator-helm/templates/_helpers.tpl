{{/*
Expand the name of the chart.
*/}}
{{- define "ldes-replicator.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ldes-replicator.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ldes-replicator.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ldes-replicator.labels" -}}
helm.sh/chart: {{ include "ldes-replicator.chart" . }}
{{ include "ldes-replicator.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ldes-replicator.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ldes-replicator.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}


{{/*
Replicator utility functions
*/}}

{{- define "ldes-replicator.urls" -}}
{{- if kindIs "string" .Values.replicator.urls}}
{{- .Values.replicator.urls }}
{{- else }}
{{- $urls := "" }}
{{- range .Values.replicator.urls }}
{{- $urls = printf "%s,%s" $urls . }}
{{- end -}}
{{- $urls = trimPrefix "," $urls }}
{{- $urls }}
{{- end }}
{{- end }}
