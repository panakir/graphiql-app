"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import styles from "./graphiForm.module.scss";

interface FormData {
  endpoint: string;
  sdlEndpoint: string;
  query: string;
  variables: string;
  headers: { key: string; value: string }[];
}

interface SuccessResponse {
  data: Record<string, unknown>;
}

interface ErrorResponse {
  error: string;
}

type ResponseData = SuccessResponse | ErrorResponse | null;

const GraphiForm = (): React.ReactNode => {
  const { register, handleSubmit, watch, setValue, control } =
    useForm<FormData>();
  const { fields, append } = useFieldArray({
    control,
    name: "headers",
  });

  const t = useTranslations("GraphiQL");
  const endpointValue = watch("endpoint");
  const sdlEndpoint = watch("sdlEndpoint") || `${endpointValue}?sdl`;

  const [response, setResponse] = useState<ResponseData>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [schema, setSchema] = useState<string | null>(null);
  const [sdlError, setSDLError] = useState<string | null>(null);

  const handleFormSubmit = async (data: FormData): Promise<void> => {
    const { endpoint, query, variables, headers } = data;

    try {
      const headersObject = headers.reduce(
        (acc: Record<string, string>, { key, value }) => {
          if (key.trim() && value.trim()) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headersObject,
        },
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : {},
        }),
      });

      const result = await res.json();
      setStatus(res.status);
      setResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        setResponse({ error: "Request failed" });
      }
      setStatus(500);
    }
  };

  const fetchSDL = async (sdlEndpoint: string): Promise<void> => {
    try {
      const res = await fetch(sdlEndpoint);

      if (!res.ok) {
        throw new Error("Failed to fetch SDL");
      }
      const sdlData = await res.text();
      setSchema(sdlData);
      setSDLError(null);
    } catch (e) {
      setSchema(null);
      setSDLError("Failed to load documentation");
      if (e instanceof Error) {
        throw new Error(e.message);
      }
    }
  };

  useEffect(() => {
    if (
      sdlEndpoint &&
      sdlEndpoint !== "undefined?sdl" &&
      sdlEndpoint !== "?sdl"
    ) {
      fetchSDL(sdlEndpoint);
    }
  }, [sdlEndpoint]);

  useEffect(() => {
    setValue("sdlEndpoint", endpointValue ? `${endpointValue}?sdl` : "");
  }, [endpointValue, setValue]);

  useState(() => {
    append({ key: "", value: "" });
  });

  return (
    <form
      className={styles.graphi}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className={styles.wrapper}>
        <h2>{t("header")}</h2>

        <label htmlFor="endpoint">{t("endpoint")}</label>
        <input
          className="input"
          id="endpoint"
          placeholder="URL"
          {...register("endpoint", { required: true })}
        />

        <label htmlFor="sdlEndpoint">SDL URL</label>
        <input
          className="input"
          id="sdlEndpoint"
          placeholder="SDL URL"
          {...register("sdlEndpoint")}
        />

        <div className={styles.headersSection}>
          <p>{t("headers")}</p>
          <div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={styles.headerRow}
              >
                <input
                  className="input"
                  placeholder={t("key")}
                  {...register(`headers.${index}.key`)}
                />
                <input
                  className="input"
                  placeholder={t("value")}
                  {...register(`headers.${index}.value`)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="button"
            onClick={() => append({ key: "", value: "" })}
          >
            {t("addHeader")}
          </button>
        </div>

        <label htmlFor="query">{t("query")}</label>
        <textarea
          className="input"
          {...register("query", { required: true })}
          id="query"
          rows={5}
        />

        <label htmlFor="variables">{t("variables")}</label>
        <textarea
          className="input"
          id="variables"
          rows={5}
          {...register("variables")}
        />

        <button
          type="submit"
          className="button"
        >
          Send
        </button>
      </div>

      {response && (
        <div className={styles.responseSection}>
          <h2>{t("response")}</h2>
          <p>
            {t("statusCode")}: {status}
          </p>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {schema && (
        <section className={styles.documentation}>
          <h2>{t("documentation")}</h2>
          <pre className={styles.documentation__text}>{schema}</pre>
        </section>
      )}

      {sdlError && (
        <p>
          {t("documentationError")} {sdlError}
        </p>
      )}
    </form>
  );
};

export default GraphiForm;
