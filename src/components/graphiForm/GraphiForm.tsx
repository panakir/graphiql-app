import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import styles from "./graphiForm.module.scss";

interface FormData {
  endpoint: string;
  sdlEndpoint: string;
  query: string;
  variables: string;
  headers: { key: string; value: string }[];
}

const GraphiForm = ({
  onSubmit,
  fetchSDL,
}: {
  onSubmit: (data: FormData) => void;
  fetchSDL: (sdlEndpoint: string) => Promise<void>;
}): React.ReactNode => {
  const { register, handleSubmit, watch, setValue } = useForm<FormData>();
  const t = useTranslations("GraphiQL");
  const endpointValue = watch("endpoint");
  const sdlEndpoint = watch("sdlEndpoint") || `${endpointValue}?sdl`;

  useEffect(() => {
    if (sdlEndpoint) {
      fetchSDL(sdlEndpoint);
    }
  }, [sdlEndpoint, fetchSDL]);

  useEffect(() => {
    setValue("sdlEndpoint", endpointValue ? `${endpointValue}?sdl` : "");
  }, [endpointValue, setValue]);

  return (
    <form
      className={styles.graphi}
      onSubmit={handleSubmit(onSubmit)}
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
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
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
          <button type="button">{t("addHeader")}</button>
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
    </form>
  );
};

export default GraphiForm;