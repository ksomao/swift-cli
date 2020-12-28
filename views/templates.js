module.exports = {
    page: (name) => {
        return `<?php
    $context = Timber::context();
    Timber::render('views/pages/${name}.twig', $context);
        `
    },
    component: (name) => {
        return `<?php
    $context = Timber::context();
    Timber::render('views/components/${name}.twig', $context);
        `
    },
    partial: (name) => {
        return `<?php
    $context = Timber::context();
    Timber::render('views/partials/${name}.twig', $context);
        `
    }
};